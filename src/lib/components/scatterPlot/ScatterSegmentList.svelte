<script>
  let {
    groups = [],
    colourScale,

    hoveredGroup = null,
    selectedGroup = null,

    hoveredSegment = null,
    selectedSegment = null,

    onPreviewGroup,
    onClearGroupPreview,
    onSelectGroup,

    onPreviewSegment,
    onClearSegmentPreview,
    onSelectSegment
  } = $props();

  const activeGroup = $derived(
    hoveredGroup ?? selectedGroup
  );

  const activeSegment = $derived(
    hoveredSegment ?? selectedSegment
  );

  function handleGroupKeydown(event, group) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onSelectGroup(group);
    }
  }

  function handleSegmentKeydown(event, segmentKey) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onSelectSegment(segmentKey);
    }
  }
</script>

<aside class="segment-panel">
  <div class="panel-heading">
    <span class="icon" aria-hidden="true">
      ✦
    </span>

    <p>
      Hover over a group or individual segment to reveal
      its position.
    </p>
  </div>

  <div class="segment-scroll">
    {#each groups as group}
      <section
        class:group-active={activeGroup === group.group}
        class:group-muted={
          activeGroup &&
          activeGroup !== group.group
        }
        class="segment-group"
      >
        <!-- Group-level colour key and controller -->
        <button
          type="button"
          class="group-button"
          class:active={activeGroup === group.group}
          aria-pressed={selectedGroup === group.group}
          onmouseenter={() =>
            onPreviewGroup(group.group)}
          onmouseleave={onClearGroupPreview}
          onfocus={() =>
            onPreviewGroup(group.group)}
          onblur={onClearGroupPreview}
          onclick={() =>
            onSelectGroup(group.group)}
          onkeydown={(event) =>
            handleGroupKeydown(
              event,
              group.group
            )}
        >
          <span
            class="group-colour"
            style={`--group-colour: ${colourScale(group.group)}`}
          ></span>

          <span class="group-name">
            {group.group}
          </span>

          <span class="group-count">
            {group.segments.length}
          </span>
        </button>

        <div class="segment-items">
          {#each group.segments as item}
            <button
              type="button"
              class="segment-button"
              class:active={
                activeSegment === item.segmentKey
              }
              class:muted={
                activeSegment &&
                activeSegment !== item.segmentKey
              }
              aria-pressed={
                selectedSegment === item.segmentKey
              }
              onmouseenter={() =>
                onPreviewSegment(item.segmentKey)}
              onmouseleave={onClearSegmentPreview}
              onfocus={() =>
                onPreviewSegment(item.segmentKey)}
              onblur={onClearSegmentPreview}
              onclick={() =>
                onSelectSegment(item.segmentKey)}
              onkeydown={(event) =>
                handleSegmentKeydown(
                  event,
                  item.segmentKey
                )}
            >
              <span
                class="segment-marker"
                style={`--segment-colour: ${colourScale(item.group)}`}
              ></span>

              <span class="segment-name">
                {item.segment}
              </span>
            </button>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</aside>

<style>
  .segment-panel {
    display: flex;
    flex-direction: column;
    min-height: 620px;
    max-height: 620px;
    border: 1px solid #d7dcda;
    border-radius: 0.65rem;
    background: #fbf8fa;
    overflow: hidden;
  }

  .panel-heading {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: start;
    padding: 0.9rem;
    border-bottom: 1px solid #dedfdf;
  }

  .panel-heading p {
    margin: 0;
    color: #333836;
    font-size: 0.78rem;
    line-height: 1.35;
  }

  .icon {
    color: #ef3387;
    font-size: 1rem;
  }

  .segment-scroll {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .segment-group {
    padding: 0.55rem;
    border-bottom: 1px solid #e2e5e4;
    transition: opacity 150ms ease;
  }

  .segment-group:last-child {
    border-bottom: 0;
  }

  .segment-group.group-muted {
    opacity: 0.32;
  }

  button {
    font: inherit;
    cursor: pointer;
  }

  .group-button {
    display: grid;
    grid-template-columns:
      auto
      minmax(0, 1fr)
      auto;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding: 0.55rem;
    background: transparent;
    color: #252a28;
    text-align: left;
  }

  .group-button:hover,
  .group-button:focus-visible,
  .group-button.active {
    border-color: #c9cfcd;
    background: white;
    outline: none;
  }

  .group-colour {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 50%;
    background: var(--group-colour);
    box-shadow:
      0 0 0 2px rgb(255 255 255),
      0 0 0 3px var(--group-colour);
  }

  .group-name {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  .group-count {
    min-width: 1.5rem;
    border-radius: 999px;
    padding: 0.15rem 0.35rem;
    background: #ecefed;
    color: #6a716e;
    font-size: 0.65rem;
    font-weight: 700;
    text-align: center;
  }

  .segment-items {
    display: grid;
    gap: 0.1rem;
    margin-top: 0.25rem;
    padding-left: 0.35rem;
  }

  .segment-button {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 0.45rem;
    padding: 0.42rem 0.45rem;
    background: transparent;
    color: #252a28;
    text-align: left;
    transition:
      opacity 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  .segment-button:hover,
  .segment-button:focus-visible,
  .segment-button.active {
    border-color: #ccd2d0;
    background: white;
    outline: none;
  }

  .segment-button.muted {
    opacity: 0.28;
  }

  .segment-marker {
    width: 0.65rem;
    height: 0.65rem;
    border: 1px solid var(--segment-colour);
    border-radius: 50%;
    background: transparent;
    transition:
      background 150ms ease,
      transform 150ms ease;
  }

  .segment-button:hover .segment-marker,
  .segment-button:focus-visible .segment-marker,
  .segment-button.active .segment-marker {
    background: var(--segment-colour);
    transform: scale(1.2);
  }

  .segment-name {
    min-width: 0;
    font-size: 0.76rem;
    line-height: 1.25;
  }

  @media (max-width: 800px) {
    .segment-panel {
      min-height: auto;
      max-height: 320px;
    }
  }
</style>