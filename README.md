# Automaton (`@webwriter/automaton@2.1.0`)
[License: MIT](LICENSE) | Version: 2.1.0

Build, visualize, and interact with different kinds of automata (DFA, NFA, PDA).

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Dfa Simple | @webwriter/automaton/snippets/dfa-simple.html |
| Dfa Complex | @webwriter/automaton/snippets/dfa-complex.html |
| Nfa Simple | @webwriter/automaton/snippets/nfa-simple.html |
| Nfa Complex | @webwriter/automaton/snippets/nfa-complex.html |
| Pda Simple | @webwriter/automaton/snippets/pda-simple.html |
| Pda Complex | @webwriter/automaton/snippets/pda-complex.html |



## `AutomatonComponent` (`<webwriter-automaton>`)
Represents an Automaton Component.
This component is responsible for rendering and managing the automaton editor and simulator.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/automaton/widgets/webwriter-automaton.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/automaton/widgets/webwriter-automaton.js"></script>
<webwriter-automaton></webwriter-automaton>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/automaton
```

```html
<link href="@webwriter/automaton/widgets/webwriter-automaton.css" rel="stylesheet">
<script type="module" src="@webwriter/automaton/widgets/webwriter-automaton.js"></script>
<webwriter-automaton></webwriter-automaton>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `nodes` (`nodes`) | `Node[]` | The nodes representing the states of the automaton. | `[]` | ✓ |
| `transitions` (`transitions`) | `Transition[]` | The transitions of the automaton. | `[]` | ✓ |
| `type` (`type`) | `AutomatonType` | The type of the automaton. Can be `'dfa'`, `'nfa'`, or `'pda'`. | `'dfa'` | ✓ |
| `mode` (`mode`) | `'edit' \| 'simulate'` | The current mode. Can be `'edit'`, or `'simulate'`. | `'edit'` | ✓ |
| `testLanguage` (`testLanguage`) | `string` | A regular expression to check the language of the automaton against. | `''` | ✓ |
| `forcedAlphabet` (`forcedAlphabet`) | `string[]` | The alphabet that the automaton is forced to use. | `[]` | ✓ |
| `testWords` (`testWords`) | `string[]` | Words used for automatically testing the automaton. | `[]` | ✓ |
| `verbose` (`verbose`) | `boolean` | Enables logging of numerous events to the console. | - | ✓ |
| `permissions` (`permissions`) | `string` | The encoded permissions for the editor. | `'777'` | ✓ |
| `showHelp` (`showHelp`) | `string` | If true, the widget displays automaton error messages. | `'true'` | ✓ |
| `showFormalDefinition` (`showFormalDefinition`) | `string` | If true, the widget allows viewing the automaton's formal definition. | `'true'` | ✓ |
| `showTransitionsTable` (`showTransitionsTable`) | `string` | If true, the widget allows viewing the automaton's transition table. | `'true'` | ✓ |
| `allowedTypes` (`allowedTypes`) | `string[]` | The types of automata that are allowed in the editor. | `['dfa', 'nfa', 'pda']` | ✓ |
| `allowedModes` (`allowedModes`) | `string[]` | The modes that are allowed in the editor. | `['edit', 'simulate']` | ✓ |
| `allowedTransformations` (`allowedTransformations`) | `string[]` | The transformations that are allowed in the editor. | `['sink']` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.6.0*