import { createFileRoute } from "@tanstack/react-router";

import { CCADMiniApp } from "@/components/CCADMiniApp";

export const Route = createFileRoute("/_layout/ccad")({
  head: () => ({
    meta: [
      { title: "Chronic Coronary Artery Disease (CCAD) — Colchicine & Secondary Prevention" },
      {
        name: "description",
        content:
          "Chronic coronary artery disease management with LoDoCo2 evidence for low-dose colchicine 0.5 mg daily.",
      },
      { property: "og:title", content: "Chronic Coronary Artery Disease — Colchicine (LoDoCo2)" },
      {
        property: "og:description",
        content:
          "LoDoCo2 evidence for low-dose colchicine in chronic coronary disease: 6.8% vs 9.6% MACE, HR 0.69.",
      },
    ],
  }),
  component: CCADMiniApp,
});
