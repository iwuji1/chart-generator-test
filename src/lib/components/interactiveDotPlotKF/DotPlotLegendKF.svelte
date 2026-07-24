<script>

  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let {
    cohorts,
    getCohortColour,
    selectedCohorts = [],
    hoveredCohort = null,
    onSelect,
    onPreview,
    onClearPreview
  } = $props();

  let legendElement;

  function isSelected(cohort) {
    return selectedCohorts.includes(cohort);
  }

  function isActive(cohort) {
    return (
      isSelected(cohort) ||
      hoveredCohort === cohort
    );
  }

  function isMuted(cohort) {
    return (
      selectedCohorts.length > 0 &&
      !isSelected(cohort)
    );
  }

  function handleKeydown(event, cohort) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onSelect(cohort);
    }
  }

  onMount(() => {
    gsap.registerPlugin(
      ScrollTrigger
    );

    /*
     * Respect the user's operating-system motion
     * preference and skip decorative movement.
     */
    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (
      reduceMotion ||
      !legendElement
    ) {
      return;
    }

    const context = gsap.context(() => {
      const pills =
        legendElement.querySelectorAll(
          '.legend-pill'
        );

      function pulsePills() {
        /*
         * Stop an unfinished pulse before starting
         * again when the controls re-enter view.
         */
        gsap.killTweensOf(pills);

        gsap.fromTo(
          pills,
          {
            scale: 1,
            boxShadow:
              '0 0 0 0 rgba(5, 198, 144, 0)'
          },
          {
            scale: 1.06,
            boxShadow:
              '0 0 0 5px rgba(5, 198, 144, 0.16)',

            duration: 1.034,
            ease: 'sine.inOut',

            /*
             * One forward and one reverse movement
             * form one pulse. repeat: 5 therefore
             * produces three complete pulses.
             */
            repeat: 5,
            yoyo: true,

            stagger: 0,

            onComplete: () => {
              gsap.set(pills, {
                clearProps:
                  'transform,boxShadow'
              });
            }
          }
        );
      }

      ScrollTrigger.create({
        trigger: legendElement,

        /*
         * Start when the legend enters the lower
         * part of the viewport.
         */
        start: 'top 82%',

        /*
         * The trigger remains active until the
         * legend has passed the upper viewport area.
         */
        end: 'bottom 18%',

        onEnter: pulsePills,
        onEnterBack: pulsePills
      });
    }, legendElement);

    return () => {
      context.revert();
    };
  });
</script>

<div
  class="legend"
  role="group"
  aria-label="Select up to two cohorts"
  bind:this={legendElement}
>
  {#each cohorts as cohort}
    <button
      type="button"
      class="legend-pill"
      class:active={isActive(cohort)}
      class:selected={isSelected(cohort)}
      class:muted={isMuted(cohort)}
      style={`--cohort-colour: ${getCohortColour(cohort)}`}
      aria-pressed={isSelected(cohort)}
      onmouseenter={() => onPreview(cohort)}
      onmouseleave={onClearPreview}
      onfocus={() => onPreview(cohort)}
      onblur={onClearPreview}
      onclick={() => onSelect(cohort)}
      onkeydown={(event) =>
        handleKeydown(event, cohort)}
    >
      <span class="legend-dot"></span>

      <span>{cohort}</span>

      {#if isSelected(cohort)}
        <span
          class="selected-indicator"
          aria-hidden="true"
        >
          ✓
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    width: 100%;
  }

  button {
    display: inline-flex;
    gap: 0.42rem;
    align-items: center;

    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.45rem 0.68rem;

    background: transparent;
    color: #272c2a;

    font: inherit;
    font-size: 0.76rem;
    cursor: pointer;

    transition:
      opacity 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  button:hover,
  button:focus-visible,
  button.active {
    border-color: #cad0cd;
    background: #f2f4f3;
    outline: none;
  }

  button.selected {
    border-color: var(--cohort-colour);
    font-weight: 700;
  }

  button.muted {
    opacity: 0.45;
  }

  .legend-dot {
    width: 0.68rem;
    height: 0.68rem;
    flex: 0 0 auto;

    box-sizing: border-box;
    border: 1.5px solid #8f9895;
    border-radius: 50%;

    background: white;

    transition:
      transform 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  .legend-pill {
    transform-origin: center;
    will-change: 
      transform, 
      box-shadow;
  }

  button.active .legend-dot,
  button.selected .legend-dot {
    border-color: var(--cohort-colour);
    background: var(--cohort-colour);
    transform: scale(1.2);
  }

  .selected-indicator {
    color: var(--cohort-colour);
    font-size: 0.7rem;
    font-weight: 900;
  }
</style>