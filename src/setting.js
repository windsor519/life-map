import React from "react";

const h = React.createElement;

export default function Setting({
  customEventError,
  customEventsText,
  isOpen,
  musicPlaying,
  onClose,
  onResetGame,
  onSetCustomEventsText,
  onSettingsChange,
  onToggleMusic,
  settings
}) {
  if (!isOpen) {
    return null;
  }

  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  const stopClickThrough = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  const toggleButton = (key, value, label) => h(
    "button",
    {
      className: settings[key] === value ? "selected" : "",
      type: "button",
      onClick: () => updateSetting(key, value)
    },
    label
  );

  return h(
    "div",
    { className: "settings-backdrop", onClick: stopClickThrough },
    h(
      "section",
      { className: "settings-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "settings-title" },
      h(
        "div",
        { className: "settings-header" },
        h("div", null, h("p", { className: "eyebrow" }, "Game settings"), h("h2", { id: "settings-title" }, "Tune your life map")),
        h("button", { className: "decision-modal-close", type: "button", "aria-label": "Close settings", onClick: onClose }, "×")
      ),
      h(
        "div",
        { className: "settings-grid" },
        h(
          "article",
          { className: "settings-card music-settings-card" },
          h(
            "div",
            { className: "settings-card-heading" },
            h("span", { className: "settings-icon", "aria-hidden": "true" }, "🎧"),
            h("div", null, h("strong", null, "Seasonal ambience"), h("small", null, "Generated tones shift as the seasons change."))
          ),
          h(
            "button",
            {
              className: `icon-toggle ${musicPlaying ? "active" : ""}`,
              type: "button",
              "aria-label": musicPlaying ? "Pause seasonal ambience" : "Play seasonal ambience",
              "aria-pressed": musicPlaying,
              onClick: onToggleMusic
            },
            h("span", { "aria-hidden": "true" }, musicPlaying ? "⏸️" : "▶️"),
            h("strong", null, musicPlaying ? "Pause" : "Play")
          ),
          h(
            "label",
            { className: "settings-range" },
            h("span", null, "Master volume ", h("strong", null, `${settings.masterVolume}%`)),
            h("input", {
              type: "range",
              min: "0",
              max: "100",
              value: settings.masterVolume,
              onChange: (event) => updateSetting("masterVolume", Number(event.target.value))
            })
          )
        ),
        h(
          "article",
          { className: "settings-card" },
          h(
            "div",
            { className: "settings-card-heading" },
            h("span", { className: "settings-icon", "aria-hidden": "true" }, "🪦"),
            h("div", null, h("strong", null, "Morbid"), h("small", null, "Allow darker surprise events."))
          ),
          h("div", { className: "segmented-control", role: "group", "aria-label": "Morbid events" }, toggleButton("morbid", false, "No"), toggleButton("morbid", true, "Yes"))
        ),
        h(
          "article",
          { className: "settings-card ai-events-card" },
          h(
            "div",
            { className: "settings-card-heading" },
            h("span", { className: "settings-icon", "aria-hidden": "true" }, "🤖"),
            h("div", null, h("strong", null, "Add AI-made events"), h("small", null, "Import pasted JSON events into your seasons."))
          ),
          h("div", { className: "segmented-control", role: "group", "aria-label": "Add AI-made events" }, toggleButton("aiMadeEvents", false, "No"), toggleButton("aiMadeEvents", true, "Yes")),
          settings.aiMadeEvents ? h(
            "label",
            { className: "settings-textarea" },
            h("span", null, "AI-made events JSON"),
            h("textarea", {
              value: customEventsText,
              onChange: (event) => onSetCustomEventsText(event.target.value),
              placeholder: '[{"id":"teen-driving-lesson","title":"Driving Lesson Nerves","description":"Your teen asks for practice before a big milestone.","severity":"moderate","icon":"🚗","accent":"teal","tags":["general"],"choices":[{"label":"Practice patiently","effects":{"children":8,"wellbeing":-2},"memory":"You practiced driving patiently."}]}]',
              rows: 6
            }),
            customEventError ? h("small", { className: "form-error", role: "alert" }, customEventError) : null
          ) : null
        )
      ),
      h(
        "div",
        { className: "settings-footer" },
        h("button", { className: "secondary", type: "button", onClick: onResetGame }, "Restart Setup"),
        h("button", { type: "button", onClick: onClose }, "Done")
      )
    )
  );
}
