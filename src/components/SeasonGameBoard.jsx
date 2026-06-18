import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import FamilyPhoto from "./FamilyPhoto.jsx";

export default function SeasonGameBoard({
  activeSeason,
  completedDecisions,
  completedThisSeason,
  isSimulationLocked,
  onOpenDecision,
  pendingThisSeason,
  seasonConfig,
  seasonDecisions,
  seasonHistory,
  selectedChoices,
  severityConfig,
  totalSeasonDecisions,
  year,
  family,
  currentAge,
  currentMonth,
  character
}) {
  const seasonCarouselRef = useRef(null);
  const seasonPanelRefs = useRef([]);
  const seasonSwipeStartXRef = useRef(null);
  const activeSeasonIndex = Math.max(0, seasonConfig.findIndex((season) => season.id === activeSeason.id));
  const hasYearHistory = Object.keys(seasonHistory ?? {}).some((key) => /^\d{4}-/.test(key));
  const getTimelineItem = (offset) => {
    const absoluteIndex = activeSeasonIndex + offset;
    const seasonIndex = ((absoluteIndex % seasonConfig.length) + seasonConfig.length) % seasonConfig.length;
    const yearOffset = Math.floor(absoluteIndex / seasonConfig.length);
    const season = seasonConfig[seasonIndex];
    const seasonYear = year + yearOffset;
    const historyKey = `${seasonYear}-${season.id}`;

    return {
      offset,
      season,
      seasonIndex,
      year: seasonYear,
      historyKey
    };
  };
  const getPreviousSelections = ({ historyKey, offset, season }) =>
    seasonHistory[historyKey] ?? (!hasYearHistory && offset < 0 ? seasonHistory[season.id] ?? [] : []);
  const allPastSeasonTimeline = Array.from({ length: 20 }, (_, index) => getTimelineItem(index - 20))
    .filter((item) => getPreviousSelections(item).length > 0);
  const memoryMoments = allPastSeasonTimeline.flatMap((item) =>
    getPreviousSelections(item).flatMap((selection) =>
      (selection.memoryMoments ?? []).map((moment) => ({
        ...moment,
        selection,
        seasonLabel: item.season.label,
        year: item.year
      }))
    )
  );
  const seasonTimeline = activeSeason.months.map((month, monthIndex) => ({
    ...getTimelineItem(0),
    month,
    monthIndex,
    monthName: new Date(year, month - 1, 1).toLocaleString("en", { month: "long" })
  }));
  const isPositiveMemory = (moment) => ["fond", "core_memory", "defining_memory"].includes(moment.memory);
  const getMemoryMomentScore = (moment) => isPositiveMemory(moment) ? Math.max(3, moment.childrenValue ?? 0) : -Math.max(2, moment.severity ?? 0);
  const memoryHighScore = memoryMoments.reduce((score, moment) => score + getMemoryMomentScore(moment), 0);
  const memoryGraphSeasons = seasonConfig.map((season) => {
    const seasonMoments = memoryMoments.filter((moment) => moment.seasonLabel === season.label);
    const score = seasonMoments.reduce((total, moment) => total + getMemoryMomentScore(moment), 0);

    return {
      ...season,
      score,
      count: seasonMoments.length,
      fondCount: seasonMoments.filter(isPositiveMemory).length,
      regretCount: seasonMoments.filter((moment) => !isPositiveMemory(moment)).length
    };
  });
  const memoryGraphPeak = Math.max(1, ...memoryGraphSeasons.map((season) => Math.abs(season.score)));
  const memoryLinePoints = memoryGraphSeasons.map((season, index) => {
    const x = memoryGraphSeasons.length <= 1 ? 50 : 10 + (index / (memoryGraphSeasons.length - 1)) * 80;
    const y = 50 - (season.score / memoryGraphPeak) * 34;

    return { ...season, x, y: Math.max(12, Math.min(88, y)) };
  });
  const memoryLinePath = memoryLinePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const activeTimelineIndex = 0;
  const totalTimelineCards = seasonTimeline.length;
  const viewedSeasonIndexRef = useRef(activeTimelineIndex);
  const [viewedSeasonIndex, setViewedSeasonIndex] = useState(activeTimelineIndex);

  const scrollToSeasonCard = useCallback((index, behavior = "smooth") => {
    const carousel = seasonCarouselRef.current;
    const panel = seasonPanelRefs.current[index];

    if (!carousel || !panel) {
      return;
    }

    const preferStartAlignment = typeof window !== "undefined"
      && window.matchMedia("(max-width: 1120px)").matches;
    const centeredLeft = panel.offsetLeft - carousel.offsetLeft - ((carousel.clientWidth - panel.clientWidth) / 2);
    const startLeft = panel.offsetLeft - carousel.offsetLeft;
    const targetLeft = preferStartAlignment ? startLeft : centeredLeft;
    const maxLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);

    carousel.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior
    });
  }, []);

  const goToSeasonCard = useCallback((index, behavior = "smooth") => {
    const nextIndex = Math.max(0, Math.min(index, totalTimelineCards - 1));
    viewedSeasonIndexRef.current = nextIndex;
    setViewedSeasonIndex(nextIndex);
    scrollToSeasonCard(nextIndex, behavior);
  }, [scrollToSeasonCard, totalTimelineCards]);

  useLayoutEffect(() => {
    goToSeasonCard(activeTimelineIndex, "auto");
  }, [activeTimelineIndex, goToSeasonCard]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      goToSeasonCard(activeTimelineIndex, "auto");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeTimelineIndex, goToSeasonCard]);

  const handleSeasonCarouselScroll = () => {
    const carousel = seasonCarouselRef.current;

    if (!carousel) {
      return;
    }

    const carouselCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    const closestIndex = seasonPanelRefs.current.reduce((closest, panel, index) => {
      if (!panel) {
        return closest;
      }

      const panelRect = panel.getBoundingClientRect();
      const distance = Math.abs(panelRect.left + panelRect.width / 2 - carouselCenter);

      return distance < closest.distance ? { distance, index } : closest;
    }, { distance: Infinity, index: viewedSeasonIndexRef.current }).index;

    if (closestIndex !== viewedSeasonIndexRef.current) {
      viewedSeasonIndexRef.current = closestIndex;
      setViewedSeasonIndex(closestIndex);
    }
  };

  const handleSeasonSwipeStart = (event) => {
    seasonSwipeStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleSeasonSwipeEnd = (event) => {
    const startX = seasonSwipeStartXRef.current;
    seasonSwipeStartXRef.current = null;

    if (startX === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    goToSeasonCard(viewedSeasonIndexRef.current + (deltaX < 0 ? 1 : -1));
  };

  return (
    <section className={`panel season-card season-${activeSeason.id}`}>
      <div className="section-heading calendar-heading">
        <div>
          <p className="eyebrow">This season</p>
          <h2>Plan {activeSeason.label} {year}</h2>
        </div>
        <span>{pendingThisSeason} actions left · random events are more likely at end of turn</span>
      </div>
      <p className="calendar-intro">Actions are planned events placed on your calendar. Pick the choices that matter this season, then simulate; random events are more likely to show up as surprise detours at the end of the turn.</p>
      <div className="board-family-strip" aria-label="Your family">
        <strong>Your family</strong>
        <FamilyPhoto family={family} currentAge={currentAge} currentMonth={currentMonth} character={character} />
      </div>
      <div className="memory-graph-strip" aria-label="Season memory graph">
        <div className="memory-graph-header">
          <div>
            <strong>Memory graph</strong>
            <span>Each season is connected as a line, with fond memories rising and regrets dipping.</span>
          </div>
          <div className="memory-graph-score">
            <span>Total memory</span>
            <strong>{memoryHighScore >= 0 ? `+${memoryHighScore}` : memoryHighScore}</strong>
          </div>
        </div>
        <div className="memory-graph" role="img" aria-label={`Total memory score ${memoryHighScore}`}>
          <span className="memory-graph-axis" aria-hidden="true" />
          <svg className="memory-graph-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="memory-graph-line-glow" d={memoryLinePath} />
            <path className="memory-graph-line-path" d={memoryLinePath} />
          </svg>
          {memoryLinePoints.map((season) => (
            <article className="memory-graph-season" key={`memory-graph-${season.id}`} style={{ "--point-x": `${season.x}%`, "--point-y": `${season.y}%` }}>
              <span className={`memory-graph-point ${season.score < 0 ? "negative" : "positive"}`} aria-hidden="true" />
              <strong>{season.icon} {season.label}</strong>
              <span>{season.count} memories</span>
              <small>{season.fondCount} fond · {season.regretCount} regrets · {season.score >= 0 ? `+${season.score}` : season.score}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="flow-panel">
        <div>
          <strong>{pendingThisSeason === 0 ? "Action plan ready" : "Action planning: choose what matters"}</strong>
          <span>{completedThisSeason}/{totalSeasonDecisions} actions selected. {pendingThisSeason === 0 ? "Review or change any highlighted choice before simulating." : "Unselected actions will auto-resolve when you simulate."}</span>
        </div>
      </div>
      <div className="season-board-frame">
        <div className="season-board-nav" aria-label="Season board navigation">
          <button
            className="season-board-arrow season-board-arrow-prev"
            type="button"
            aria-label="Show previous season card"
            disabled={viewedSeasonIndex === 0}
            onClick={() => goToSeasonCard(viewedSeasonIndex - 1)}
          >
            ←
          </button>
          <button
            className="season-board-arrow season-board-arrow-next"
            type="button"
            aria-label="Show next season card"
            disabled={viewedSeasonIndex === totalTimelineCards - 1}
            onClick={() => goToSeasonCard(viewedSeasonIndex + 1)}
          >
            →
          </button>
        </div>
        <div
          className="season-carousel"
          aria-label="Season cards"
          onScroll={handleSeasonCarouselScroll}
          onTouchStart={handleSeasonSwipeStart}
          onTouchEnd={handleSeasonSwipeEnd}
          ref={seasonCarouselRef}
        >
          {seasonTimeline.map(({ season, offset, year: seasonYear, month, monthName, monthIndex }, timelineIndex) => {
            const cardIndex = timelineIndex;
            const monthGroup = {
              month,
              monthName,
              decisions: seasonDecisions.filter((decision) => decision.day.month === month)
            };

            return (
              <article
                className={`season-panel season-panel-${season.id} active ${cardIndex === viewedSeasonIndex ? "in-view" : ""}`}
                key={`${seasonYear}-${season.id}-${offset}-${month}`}
                ref={(panel) => {
                  seasonPanelRefs.current[cardIndex] = panel;
                }}
              >
                <div className="season-panel-header">
                  <span className="season-icon" aria-hidden="true">{season.icon}</span>
                  <div>
                    <p className="eyebrow">Month {monthIndex + 1} of 3 · {season.label} {seasonYear}</p>
                    <h3>{monthName}</h3>
                  </div>
                </div>
                <p>{season.description}</p>
                <div className="season-decisions season-decisions-by-month">
                    <section className="season-month-group" key={`${season.id}-${monthGroup.month}`}>
                      <div className="season-month-heading">
                        <strong>{monthGroup.monthName}</strong>
                        <span>{monthGroup.decisions.length} actions</span>
                      </div>
                      {monthGroup.decisions.length > 0 ? monthGroup.decisions.map((decision) => {
                        const selectedChoice = selectedChoices[decision.key];
                        const lockedLegacyChoice = !selectedChoice && completedDecisions.includes(decision.key);
                        const completed = Boolean(selectedChoice) || lockedLegacyChoice;

                        return (
                          <section className={`decision-card severity-card-${decision.severity} accent-${decision.visual.accent} ${completed ? "completed" : ""}`} key={decision.key}>
                            <button
                              className="decision-toggle"
                              type="button"
                              aria-haspopup="dialog"
                              onClick={() => onOpenDecision({ decision, dayLabel: decision.day.dayLabel })}
                              disabled={isSimulationLocked}
                            >
                              <span className="decision-title">
                                <span className="mini-icon" aria-hidden="true">{decision.visual.icon}</span>
                                <span>
                                  <small>Action · {decision.day.dayLabel}</small>
                                  <h3>{decision.title}</h3>
                                </span>
                              </span>
                              <span className="decision-status">
                                {selectedChoice ? <span className="selected-pill">Picked</span> : null}
                                <span className={`severity-badge severity-${decision.severity}`}>
                                  <span aria-hidden="true">{severityConfig[decision.severity]?.icon}</span>
                                  {severityConfig[decision.severity]?.label ?? decision.severity}
                                </span>
                                <span className="expand-cue" aria-hidden="true">↗</span>
                              </span>
                            </button>
                          </section>
                        );
                      }) : <p className="season-empty">No planned actions this month.</p>}
                    </section>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
