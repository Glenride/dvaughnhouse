// Homepage bio paragraphs, shared by the homepage (src/home.jsx) and
// the markdown registry (src/lib/md/registry.js). Pure module — the
// system names come from the central project module, as on the page.
import { bioSystemLabels } from "./projects.js";

export const BIO_PARAS = [
  "I spent nearly 15 years running regulated clinical research: data, protocols, proof. Now I build independently: systems, software, and stories, held to the same standard. The machine proposes. The Human decides.",
  `I’m building Glenride into a company of one that ships real systems (${bioSystemLabels().join(", ")}) and the media that explains them, so the work outlives the pitch.`,
  "Because good engineering too often feels sterile, and good media too often lacks rigor. I create where code, evidence, and story lock together.",
];
