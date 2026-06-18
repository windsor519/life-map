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
  const seasonTimeline = [getTimelineItem(0)];
  const mapNodes = seasonDecisions.slice(0, 6);
  const fondMemoryCount = memoryMoments.filter((moment) => ["fond", "core_memory", "defining_memory"].includes(moment.memory)).length;
  const regretMemoryCount = memoryMoments.filter((moment) => ["regret", "soft_regret"].includes(moment.memory)).length;
  const memoryHighScore = memoryMoments.reduce((score, moment) => score + (["fond", "core_memory", "defining_memory"].includes(moment.memory) ? Math.max(3, moment.childrenValue ?? 0) : -Math.max(2, moment.severity ?? 0)), 0);
  const memoryCardOffset = 1;
  const activeTimelineIndex = seasonTimeline.findIndex((item) => item.offset === 0) + memoryCardOffset;
  const totalTimelineCards = seasonTimeline.length + memoryCardOffset;
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
      <div className="life-map-strip" aria-label={`${activeSeason.label} life map route`}>
        <div className="life-map-route" aria-hidden="true">
          <span className="life-map-path" />
          <span className="life-map-marker home">🏠</span>
          {mapNodes.map((decision, index) => (
            <span
              className={`life-map-marker node severity-card-${decision.severity} accent-${decision.visual.accent}`}
              key={`map-${decision.key}`}
              style={{ left: `${mapNodes.length > 1 ? 18 + (index * (58 / (mapNodes.length - 1))) : 47}%` }}
            >
              {decision.visual.icon}
            </span>
          ))}
          <span className="life-map-marker random">🎲</span>
        </div>
        <div className="life-map-copy">
          <strong>Life on the map</strong>
          <span>Your family marker moves through seasonal stops, planned choices, memories, and more frequent surprise detours.</span>
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
          <article
            className={`season-panel season-panel-memory past ${viewedSeasonIndex === 0 ? "in-view" : ""}`}
            ref={(panel) => {
              seasonPanelRefs.current[0] = panel;
            }}
          >
            <div className="season-panel-score" aria-label={`Memory score ${memoryHighScore}`}>
              <span>Memory score</span>
              <strong>{memoryHighScore >= 0 ? `+${memoryHighScore}` : memoryHighScore}</strong>
            </div>
            <div className="season-panel-header">
              <span className="season-icon" aria-hidden="true">🧠</span>
              <div>
                <p className="eyebrow">Unbounded score</p>
                <h3>Memory</h3>
              </div>
            </div>
            <p>Memory has no minimum or maximum. Fond, core, and defining memories add their children-bond value; regrets subtract the missed-memory gap, so many fond memories can push the score very high and many regrets can drive it negative.</p>
            <div className="season-memory-history" aria-label="Accumulated fond memories and regrets">
              <strong>Fond memories & regrets</strong>
              <div>
                {memoryMoments.length > 0 ? memoryMoments.slice().reverse().map((moment) => (
                  <article className={`season-memory-item memory-${moment.memory}`} key={`memory-${moment.selection.id}-${moment.id}`}>
                    <span>{moment.seasonLabel} {moment.year} · {moment.label}</span>
                    <em>{moment.source}</em>
                    <strong>{moment.choice ?? `Missed: ${moment.missed}`}</strong>
                    <small>{moment.memory === "fond" || moment.memory === "core_memory" || moment.memory === "defining_memory"
                      ? `Fond memory · ${moment.reason}`
                      : `Regret · ${moment.reason}`}</small>
                  </article>
                )) : (
                  <p className="season-memory-empty">No fond memories or regrets recorded yet. Simulate seasons to start scoring them.</p>
                )}
              </div>
            </div>
          </article>
          {seasonTimeline.map(({ season, offset, year: seasonYear }, timelineIndex) => {
            const cardIndex = timelineIndex + memoryCardOffset;
            const cardDecisions = seasonDecisions;

            return (
              <article
                className={`season-panel season-panel-${season.id} active ${cardIndex === viewedSeasonIndex ? "in-view" : ""}`}
                key={`${seasonYear}-${season.id}-${offset}`}
                ref={(panel) => {
                  seasonPanelRefs.current[cardIndex] = panel;
                }}
              >
                <div className="season-panel-header">
                  <span className="season-icon" aria-hidden="true">{season.icon}</span>
                  <div>
                    <p className="eyebrow">Current action plan</p>
                    <h3>{season.label}</h3>
                  </div>
                </div>
                <p>{season.description}</p>
                <div className="season-decisions">
                  {cardDecisions.length > 0 ? cardDecisions.map((decision) => {
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
                  }) : <p className="season-empty">This season has no planned actions. Simulate to discover which surprise detours appear at the end of the turn.</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
