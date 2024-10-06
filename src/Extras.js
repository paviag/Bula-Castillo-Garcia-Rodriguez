export function getRenderedEdge(source, target, label) {
  /**
   * Retorna el objeto de arista con el formato requerido para
   * conformar un elemento de un CytoscapeComponent
   */
  return {
    data: { source: source, target: target, label: label, lineColor: "black" },
  };
}

export function addConcatOp(regex) {
  /**
   * Retorna regex modificada para contener "." como
   * operadores de concatenación
   */

  if (!regex.length) {
    return "";
  }

  let simb = "[^\\*\\+\\?\\(\\)\\|]";
  let op = "\\*|\\+|\\?";
  // Condiciones para añadir un operador de concatenación
  let c1 = "(" + simb + ")(" + op + ")?(?=(\\(|" + simb + "))"; // Un símbolo seguido de un paréntesis inicial, pudiendo estar separados por un operador binario (*,+,?). O dos símbolos consecutivos que pueden ser separados por un operador binario (*,+,?)
  //grupos:"(    0   )(  1   )?(?=(       2     )";
  let c2 = "(\\))(" + op + ")?(\\(*)(?=(" + simb + "))"; // Un paréntesis final seguido de un símbolo, pudiendo estar separados por un operador binario (*,+,?)
  //grupos:"( 3 )(  4   )?(  5 )(?=(   6    ))";

  /*
  // Condiciones para añadir un operador de concatenación
  let c1 = "(\\w|&|\\d)(\\*|\\+|\\?)?(?=(\\(|\\w|&|\\d))"; // Un símbolo seguido de un paréntesis inicial, pudiendo estar separados por un operador binario (*,+,?). O dos símbolos consecutivos que pueden ser separados por un operador binario (*,+,?)
  //grupos:"(    0    )(      1    )?(?=(        2     )"; // Un símbolo seguido de un paréntesis inicial, pudiendo estar separados por un operador binario (*,+,?). O dos símbolos consecutivos que pueden ser separados por un operador binario (*,+,?)
  let c2 = "(\\))(\\*|\\+|\\?)?(\\(*)(?=(\\w|&|\\d))"; // Un paréntesis final seguido de un símbolo, pudiendo estar separados por un operador binario (*,+,?)
  //grupos:"( 3 )(     4     )?( 5 )?(?=(    6    ))"; // Un paréntesis final seguido de un símbolo, pudiendo estar separados por un operador binario (*,+,?)
  */

  // Encuentra dónde añadir operadores de concatenación
  let addConcat = new RegExp(`${c1}|${c2}`, "dg");

  // Añade operadores de concatenación
  return regex.replace(
    addConcat,
    (
      match,
      p0 = "",
      p1 = "",
      p2 = "",
      p3 = "",
      p4 = "",
      p5 = "",
      p6 = "",
      offset,
      string
    ) => {
      // Reemplaza matches en la expresión para incluir los
      // operadores de concatenación
      return p0 ? p0 + p1 + "." : p3 + p4 + "." + p5;
    }
  );
}

export function adjustedStateLabels(nodos, aristas) {
  /**
   * Retorna un diccionario para ajustas las etiquetas de los nodos
   * de forma que queden como una lista de números consecutivos
   */
  let etiquetasAjustadas = {};
  for (let i = 0; i < nodos.length; i++) {
    etiquetasAjustadas[nodos[i]] = i;
  }
  return etiquetasAjustadas;
}

export function arraysShareAllElements(a, b) {
  /**
   * Retorna true si los arrays de entrada contienen los mismos
   * elementos sin importar su orden
   */
  if (a.length == b.length) {
    return a.findIndex((e) => !b.includes(e)) == -1;
  } else {
    return false;
  }
}

export function arrayIncludesArray(m, s) {
  /**
   * Retorna true si el array "s" comparte los mismos elementos
   * con uno de los arrays de "m". "m" es un array de arrays.
   */
  if (m.length == 0) {
    return false;
  }
  return (
    m.findIndex((a) => {
      // Encuentra subarray a contenido en m que NO contiene algun
      // elemento no contenido en s, es decir, contiene los mismos
      // elementos de s
      return arraysShareAllElements(a, s);
    }) != -1
  );
}
