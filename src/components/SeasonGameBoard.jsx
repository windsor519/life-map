import { useCallback, useEffect, useRef, useState } from "react";

export default function SeasonGameBoard({
  activeSeason,
  completedDecisions,
  completedThisSeason,
  getSeasonMonthNames,
  isSimulationLocked,
  onOpenDecision,
  pendingThisSeason,
  seasonConfig,
  seasonDecisions,
  seasonHistory,
  selectedChoices,
  severityConfig,
  totalSeasonDecisions,
  year
}) {
  const seasonCarouselRef = useRef(null);
  const seasonPanelRefs = useRef([]);
  const seasonSwipeStartXRef = useRef(null);
  const activeSeasonIndex = Math.max(0, seasonConfig.findIndex((season) => season.id === activeSeason.id));
  const visibleSeasonOffsets = Array.from({ length: 11 }, (_, index) => index - 7);
  const seasonTimeline = visibleSeasonOffsets.map((offset) => {
    const absoluteIndex = activeSeasonIndex + offset;
    const seasonIndex = ((absoluteIndex % seasonConfig.length) + seasonConfig.length) % seasonConfig.length;
    const yearOffset = Math.floor(absoluteIndex / seasonConfig.length);

    return {
      offset,
      season: seasonConfig[seasonIndex],
      seasonIndex,
      year: year + yearOffset
    };
  });
  const activeTimelineIndex = seasonTimeline.findIndex((item) => item.offset === 0);
  const hasYearHistory = Object.keys(seasonHistory ?? {}).some((key) => /^\d{4}-/.test(key));
  const viewedSeasonIndexRef = useRef(activeTimelineIndex);
  const [viewedSeasonIndex, setViewedSeasonIndex] = useState(activeTimelineIndex);

  const goToSeasonCard = useCallback((index) => {
    const nextIndex = Math.max(0, Math.min(index, seasonTimeline.length - 1));
    viewedSeasonIndexRef.current = nextIndex;
    setViewedSeasonIndex(nextIndex);
    seasonPanelRefs.current[nextIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }, [seasonTimeline.length]);

  useEffect(() => {
    goToSeasonCard(activeTimelineIndex);
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
        <span>{pendingThisSeason} decisions left · seasonal emergency chance</span>
      </div>
      <p className="calendar-intro">Trade the calendar grid for a seasonal rhythm. Pick the choices that matter this year, then let the simulation resolve the rest across {getSeasonMonthNames(activeSeason)} {year}.</p>
      <div className="flow-panel">
        <div>
          <strong>{pendingThisSeason === 0 ? "Season plan ready" : "Season planning: choose what matters"}</strong>
          <span>{completedThisSeason}/{totalSeasonDecisions} decisions selected. {pendingThisSeason === 0 ? "Review or change any highlighted choice before advancing." : "Unselected seasonal moments will auto-resolve when you simulate."}</span>
        </div>
      </div>
      <div
        className="season-carousel"
        aria-label="Season cards"
        onScroll={handleSeasonCarouselScroll}
        onTouchStart={handleSeasonSwipeStart}
        onTouchEnd={handleSeasonSwipeEnd}
        ref={seasonCarouselRef}
      >
        {seasonTimeline.map(({ season, seasonIndex, offset, year: seasonYear }, timelineIndex) => {
          const isActive = offset === 0;
          const isPast = offset < 0;
          const isFuture = offset > 0;
          const seasonMonthNames = getSeasonMonthNames(season);
          const cardDecisions = isActive ? seasonDecisions : [];
          const historyKey = `${seasonYear}-${season.id}`;
          const previousSelections = seasonHistory[historyKey] ?? (!hasYearHistory && isPast ? seasonHistory[season.id] ?? [] : []);

          return (
            <article
              className={`season-panel season-panel-${season.id} ${isActive ? "active" : ""} ${isPast ? "past" : ""} ${isFuture ? "future" : ""} ${timelineIndex === viewedSeasonIndex ? "in-view" : ""}`}
              key={`${seasonYear}-${season.id}-${offset}`}
              ref={(panel) => {
                seasonPanelRefs.current[timelineIndex] = panel;
              }}
            >
              <div className="season-panel-header">
                <span className="season-icon" aria-hidden="true">{season.icon}</span>
                <div>
                  <p className="eyebrow">{seasonYear} · {offset === 0 ? "Selected season" : isPast ? "Past season" : "Future season"}</p>
                  <h3>{season.label}</h3>
                </div>
                <div className="season-card-nav" aria-label={`${season.label} ${seasonYear} card navigation`}>
                  <button
                    className="season-card-arrow"
                    type="button"
                    aria-label={`Show previous season card before ${season.label} ${seasonYear}`}
                    onClick={() => goToSeasonCard(timelineIndex - 1)}
                  >
                    ←
                  </button>
                  <button
                    className="season-card-arrow"
                    type="button"
                    aria-label={`Show next season card after ${season.label} ${seasonYear}`}
                    onClick={() => goToSeasonCard(timelineIndex + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
              <p>{season.description}</p>
              <span className="season-months">{seasonMonthNames} · {seasonYear}</span>
              {isActive ? (
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
                              <small>{decision.visual.label} · {decision.day.dayLabel}</small>
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
                  }) : <p className="season-empty">This season is unusually quiet. Simulate to discover whether life stays that way.</p>}
                </div>
              ) : previousSelections.length > 0 ? (
                <div className="season-history" aria-label={`${season.label} ${seasonYear} selected choices`}>
                  <strong>{seasonYear} selections</strong>
                  {previousSelections.slice(0, 4).map((selection) => (
                    <div className="season-history-item" key={selection.id}>
                      <span>{selection.dayName}</span>
                      <em>{selection.eventTitle}</em>
                      <strong>{selection.label}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="season-preview">
                  <strong>{season.months.length} month arc</strong>
                  <span>{isFuture ? `${Math.abs(offset)} season${Math.abs(offset) === 1 ? "" : "s"} ahead` : `No selections saved for ${seasonYear}`}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
