import tippy from "tippy.js";

export function addTooltips(cy, dataField) {
  /**
   * Añade tooltips a los nodos con la información del campo
   * dataField a los nodos que lo contengan en su data
   */
  //cy.fit();
  // Crea el tooltip cuando el mouse está sobre el nodo
  cy.nodes().unbind("mouseover");
  cy.bind("mouseover", "node", function (event) {
    let node = event.target;
    let data = node.data()[dataField];
    let contentEle = () => {
      let content = document.createElement("div");
      content.innerHTML =
        '<div style="background-color: black; border-radius: 15px; color: white; padding: 10px; max-width: 200px; overflow: break-word; text-align: center;">' +
        "<b>" +
        data.title +
        "</b><br>" +
        data.content +
        "</div>";
      return content;
    };
    if (data) {
      if (!node.tip?.state.isMounted) {
        let tip = node.popper({ content: contentEle }, event);
        node.tip = tip;
      } else {
        node.tip.setContent(contentEle);
      }
    }
  });

  // Destruye el tooltip cuando el mouse ya no está sobre el nodo
  cy.nodes().unbind("mouseout");
  cy.bind("mouseout", "node", function (event) {
    event.target.tip?.destroy();
  });

  // Mueve el tooltip junto con el nodo
  cy.nodes().unbind("drag");
  cy.bind("drag", "node", function (event) {
    event.target.tip?.popperInstance.update();
  });

  return cy;
}

export function tippyFactory(ref, content) {
  /**
   * Función base para crear tooltips para el grafo
   */
  let tip = tippy(document.createElement("div"), {
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: "manual",
    content: content,
    arrow: true,
    placement: "top",
    hideOnClick: false,
    showOnCreate: true,
  });
  return tip;
}
