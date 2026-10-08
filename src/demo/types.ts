/** Script step types driven by the DemoStage runner. `to` is a data-demo name
 *  (resolves to [data-demo="name"] inside the stage) or a raw CSS selector. */
export type Target = string;
export type Step =
  | { t: 'move'; to: Target; ms?: number }
  | { t: 'wait'; ms: number }
  | { t: 'click'; to: Target }                       // moves, presses, then really clicks the element
  | { t: 'type'; to: Target; text: string; cps?: number } // moves, clicks (focus) and types char by char
  | { t: 'select'; to: Target; value: string }       // moves, clicks, sets <select> value
  | { t: 'screen'; id: string }                      // clicks [data-demo="nav-<id>"]
  | { t: 'highlight'; to: Target | Target[]; ms?: number } // soft ring pulse on elements
  | { t: 'scroll'; to: Target; by: number; ms?: number };  // smooth scrollTop of a container (design px)

export type Bilingual = { es: string; en: string };
export type Scene = { id: string; label: Bilingual; steps: Step[] };
export type Script = Scene[];

/** Every replica is a plain React component, rendered at a fixed design size and scaled by the stage. */
export type ReplicaSize = { w: number; h: number };
