import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AmbientParticles from "./AmbientParticles.jsx";
import DynastyProfilePanel from "./DynastyProfilePanel.jsx";
import FamilyPhoto from "./FamilyPhoto.jsx";
import LegacyEvolutionPanel from "./LegacyEvolutionPanel.jsx";
import PhaseThreeLegacyPanorama from "./PhaseThreeLegacyPanorama.jsx";
import PhaseTwoVisuals from "./PhaseTwoVisuals.jsx";
import WorldUnlocksLayer from "./WorldUnlocksLayer.jsx";

const monthAverageTemperaturesF = {
  1: 32,
  2: 36,
  3: 46,
  4: 58,
  5: 68,
  6: 78,
  7: 84,
  8: 82,
  9: 73,
  10: 60,
  11: 48,
  12: 36
};

const getMonthTemperatureStyle = (month) => {
  const averageTemperature = monthAverageTemperaturesF[month] ?? 60;
  const warmth = Math.max(0, Math.min(1, (averageTemperature - 30) / 55));
  const hue = Math.round(210 - warmth * 185);
  const glowHue = Math.round(220 - warmth * 190);

  return {
    "--month-temp": averageTemperature,
    "--month-temp-hue": hue,
    "--month-temp-glow-hue": glowHue,
    "--month-temp-alpha": (0.18 + warmth * 0.16).toFixed(3),
    "--month-temp-edge-alpha": (0.24 + warmth * 0.2).toFixed(3)
  };
};

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
  character,
  actionPointsLeft = 3,
  actionPointMax = 3,
  pressures = {},
  lifeProjects = [],
  npcs = [],
  career = null
}) {
  const seasonCarouselRef = useRef(null);
  const seasonPanelRefs = useRef([]);
  const seasonSwipeStartXRef = useRef(null);
  const availableSeasons = Array.isArray(seasonConfig) ? seasonConfig : [];
  const hasMemoryGraphSeasons = availableSeasons.length > 0;
  const activeSeasonIndex = Math.max(0, availableSeasons.findIndex((season) => season.id === activeSeason.id));
  const hasYearHistory = Object.keys(seasonHistory ?? {}).some((key) => /^\d{4}-/.test(key));
  const getTimelineItem = (offset) => {
    if (!hasMemoryGraphSeasons) {
      return {
        offset,
        season: activeSeason,
        seasonIndex: 0,
        year,
        historyKey: `${year}-${activeSeason.id ?? "season"}`
      };
    }

    const absoluteIndex = activeSeasonIndex + offset;
    const seasonIndex = ((absoluteIndex % availableSeasons.length) + availableSeasons.length) % availableSeasons.length;
    const yearOffset = Math.floor(absoluteIndex / availableSeasons.length);
    const season = availableSeasons[seasonIndex];
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
        eventTitle: selection.eventTitle ?? moment.eventTitle,
        label: selection.label ?? moment.label,
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
  const memoryGraphMoments = memoryMoments.reduce((moments, moment, index) => {
    const score = getMemoryMomentScore(moment);
    const cumulativeScore = (moments.at(-1)?.cumulativeScore ?? 0) + score;

    return [
      ...moments,
      {
        ...moment,
        id: `${moment.selection?.id ?? "memory"}-${moment.year}-${index}`,
        score,
        cumulativeScore,
        isPositive: isPositiveMemory(moment),
        sequenceNumber: index + 1
      }
    ];
  }, []);

  const memoryGraphPeak = Math.max(1, ...memoryGraphMoments.map((moment) => Math.abs(moment.cumulativeScore)));
  const memoryLinePoints = memoryGraphMoments.map((moment, index) => {
    const x = memoryGraphMoments.length <= 1 ? 50 : 4 + (index / (memoryGraphMoments.length - 1)) * 92;
    const y = 50 - (moment.cumulativeScore / memoryGraphPeak) * 34;

    return { ...moment, x, y: Math.max(10, Math.min(90, y)) };
  });
  const memoryLinePath = memoryLinePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const memoryGraphColumnCount = Math.max(1, memoryLinePoints.length);
  const activeTimelineIndex = 0;
  const totalTimelineCards = seasonTimeline.length;
  const viewedSeasonIndexRef = useRef(activeTimelineIndex);
  const [viewedSeasonIndex, setViewedSeasonIndex] = useState(activeTimelineIndex);
  const [activeMemoryPointId, setActiveMemoryPointId] = useState(null);
  const activeMemoryPoint = useMemo(() => memoryLinePoints.find((point) => point.id === activeMemoryPointId) ?? null, [activeMemoryPointId, memoryLinePoints]);

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
      <AmbientParticles />
      <div className="section-heading calendar-heading">
        <div>
          <p className="eyebrow">This season</p>
          <h2>Plan {activeSeason.label} {year}</h2>
        </div>
        <span>{actionPointsLeft}/{actionPointMax} opportunity points left · unchosen paths become the story</span>
      </div>
      <p className="calendar-intro">You only get 3 opportunity points each season. Choose what you will actively protect; everything else is auto-resolved and pressure meters decide which consequences surface later.</p>
      <div className="life-dashboard-grid" aria-label="Life dashboard">
        <article className="dashboard-card"><span>Career</span><strong>{career?.title ?? "Unassigned"}</strong><small>Salary {career?.salary} · Stress {career?.stress} · {career?.advancement}</small></article>
        <article className="dashboard-card"><span>Opportunity Points</span><strong>{actionPointsLeft}/{actionPointMax}</strong><small>Impossible choices: work, family, health, social, education, side business.</small></article>
        {Object.entries(pressures).map(([key, value]) => (
          <article className="dashboard-card" key={key}>
            <span>{key} pressure</span><strong>{value}</strong><div className="pressure-meter"><span style={{ width: `${value}%` }} /></div>
          </article>
        ))}
        {lifeProjects.slice(0, 4).map((project) => (
          <article className="dashboard-card" key={project.id}>
            <span>{project.stage} · {project.horizon}</span><strong>{project.title}</strong><div className="project-meter"><span style={{ width: `${project.progress}%` }} /></div><small>Risk: {project.risk}</small>
          </article>
        ))}
        {npcs.slice(0, 4).map((npc) => (
          <article className="dashboard-card" key={npc.id}>
            <span>{npc.role}</span><strong>{npc.name}</strong><div className="npc-meter"><span style={{ width: `${npc.bond}%` }} /></div><small>Remembers {npc.remembers}</small>
          </article>
        ))}
      </div>
      <div className="board-family-strip" aria-label="Your family">
        <strong>Your family</strong>
        <FamilyPhoto family={family} currentAge={currentAge} currentMonth={currentMonth} character={character} />
      </div>
      <PhaseTwoVisuals
        activeSeason={activeSeason}
        career={career}
        currentAge={currentAge}
        family={family}
        lifeProjects={lifeProjects}
        memoryHighScore={memoryHighScore}
        memoryMoments={memoryGraphMoments}
        pressures={pressures}
      />
      <PhaseThreeLegacyPanorama
        activeSeason={activeSeason}
        career={career}
        currentAge={currentAge}
        family={family}
        lifeProjects={lifeProjects}
        memoryHighScore={memoryHighScore}
        memoryMoments={memoryGraphMoments}
        pressures={pressures}
      />
      <LegacyEvolutionPanel
        career={career}
        currentAge={currentAge}
        family={family}
        lifeProjects={lifeProjects}
        memoryHighScore={memoryHighScore}
        memoryMoments={memoryGraphMoments}
        pressures={pressures}
      />
      <WorldUnlocksLayer
        career={career}
        family={family}
        lifeProjects={lifeProjects}
        memoryHighScore={memoryHighScore}
        memoryMoments={memoryGraphMoments}
        pressures={pressures}
      />
      <DynastyProfilePanel
        career={career}
        currentAge={currentAge}
        family={family}
        lifeProjects={lifeProjects}
        memoryHighScore={memoryHighScore}
        memoryMoments={memoryGraphMoments}
        pressures={pressures}
      />
      <div className="memory-graph-strip" aria-label="Season memory graph">
        <div className="memory-graph-header">
          <div>
            <strong>Memory graph</strong>
            <span>Every memory is plotted in order, with fond memories rising and regrets dipping.</span>
          </div>
          <div className="memory-graph-score">
            <span>Total memory</span>
            <strong>{memoryHighScore >= 0 ? `+${memoryHighScore}` : memoryHighScore}</strong>
          </div>
        </div>
        <div className="memory-graph-viewport" role="img" aria-label={`Total memory score ${memoryHighScore}`}>
          <div className="memory-graph" style={{ "--memory-season-count": memoryGraphColumnCount }}>
            {memoryLinePoints.length > 0 ? (
              <>
                <span className="memory-graph-axis" aria-hidden="true" />
                <svg className="memory-graph-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="memory-graph-line-glow" d={memoryLinePath} />
                  <path className="memory-graph-line-path" d={memoryLinePath} />
                </svg>
              </>
            ) : (
              <p className="memory-graph-empty">No seasons configured yet. Memories will appear here once seasons are available.</p>
            )}
            {memoryLinePoints.map((point) => (
              <button
                aria-label={`Memory ${point.sequenceNumber}: ${point.seasonLabel} ${point.year}, score ${point.score >= 0 ? `+${point.score}` : point.score}`}
                className="memory-graph-season"
                key={`memory-graph-${point.id}`}
                onClick={() => setActiveMemoryPointId(point.id)}
                style={{ "--point-x": `${point.x}%`, "--point-y": `${point.y}%` }}
                title={`${point.year} · ${point.seasonLabel} · ${point.score >= 0 ? `+${point.score}` : point.score}`}
                type="button"
              >
                <span className={`memory-graph-point ${point.score < 0 ? "negative" : "positive"}`} aria-hidden="true" />
                <strong>{point.sequenceNumber}</strong>
                <span>{point.seasonLabel}</span>
                <small>{point.score >= 0 ? `+${point.score}` : point.score} · total {point.cumulativeScore >= 0 ? `+${point.cumulativeScore}` : point.cumulativeScore}</small>
              </button>
            ))}
          </div>
        </div>
        {activeMemoryPoint ? (
          <div className="memory-detail-panel" aria-live="polite">
            <div className="memory-detail-heading">
              <strong>Memory {activeMemoryPoint.sequenceNumber} · {activeMemoryPoint.seasonLabel} {activeMemoryPoint.year}</strong>
              <button type="button" className="memory-detail-close" onClick={() => setActiveMemoryPointId(null)} aria-label="Close memory details">×</button>
            </div>
            <div className="memory-detail-list">
              <article className={`memory-detail-item ${activeMemoryPoint.score < 0 ? "negative" : "positive"}`}>
                <span>{activeMemoryPoint.year} · {activeMemoryPoint.selection?.dayName ?? "Season"}</span>
                <strong>{activeMemoryPoint.selection?.eventTitle ?? "Memory"}</strong>
                <p>{activeMemoryPoint.text ?? activeMemoryPoint.selection?.memory ?? activeMemoryPoint.selection?.label ?? "This choice changed the family story."}</p>
                <em>{activeMemoryPoint.score >= 0 ? `+${activeMemoryPoint.score}` : activeMemoryPoint.score} · total {activeMemoryPoint.cumulativeScore >= 0 ? `+${activeMemoryPoint.cumulativeScore}` : activeMemoryPoint.cumulativeScore}</em>
              </article>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flow-panel">
        <div>
          <strong>{pendingThisSeason === 0 ? "Action plan ready" : "Action planning: choose what matters"}</strong>
          <span>{completedThisSeason}/{totalSeasonDecisions} actions selected. {pendingThisSeason === 0 ? "Review or change any highlighted choice before simulating." : "Unselected actions will auto-resolve when you simulate."}</span>
        </div>
      </div>
      <div className="season-board-frame">
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
                style={getMonthTemperatureStyle(month)}
                ref={(panel) => {
                  seasonPanelRefs.current[cardIndex] = panel;
                }}
              >
                <div className="season-panel-header">
                  <span className="season-icon" aria-hidden="true">{season.icon}</span>
                  <div>
                    <p className="eyebrow">Month {monthIndex + 1} of {activeSeason.months.length} · {season.label} {seasonYear} · avg {monthAverageTemperaturesF[month] ?? 60}°F</p>
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
