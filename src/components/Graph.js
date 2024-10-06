import cytoscape from "cytoscape";
import cytoscapePopper from "cytoscape-popper";
import CytoscapeComponent from "react-cytoscapejs";
import { addTooltips, tippyFactory } from "../Tooltips";

cytoscape.use(cytoscapePopper(tippyFactory));

export default function Graph({ elementos, tooltips = true }) {
  /**
   * Componente para el grafo de un autómata
   */
  return (
    <CytoscapeComponent
      elements={elementos}
      userZoomingEnabled={false}
      cy={(cy) => (tooltips ? addTooltips(cy, "tooltip") : cy)}
      style={{
        width: "100%",
        height: "300px",
        border: "1px black",
      }}
      stylesheet={[
        {
          selector: "node",
          style: {
            backgroundColor: "white",
            label: "data(label)",
            textValign: "center",
            borderWidth: "data(borderWidth)",
            borderStyle: "data(borderStyle)",
            borderColor: "data(borderColor)",
          },
        },
        {
          selector: "node:selected",
          style: {
            borderColor: "blue",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            targetArrowShape: "triangle",
            targetArrowColor: "data(lineColor)",
            label: "data(label)",
            textOutlineColor: "white",
            textOutlineWidth: "3px",
            lineColor: "data(lineColor)",
            curveStyle: "bezier",
          },
        },
      ]}
      layout={{
        name: "breadthfirst",
        roots: ["i"],
        directed: true,
      }}
    />
  );
}
