import {
  getRenderedEdge,
  arrayIncludesArray,
  arraysShareAllElements,
} from "./Extras";
import Automata from "./Automata";

export default function AFDSubconjuntos(AFNThompson) {
  /**
   * Retorna el AFD resultante de aplicar el método de subconjuntos sobre
   * un AFN no óptimo.
   */
  if (!AFNThompson) {
    return null;
  }
  let T, U, estadosD;
  let tranD = {};
  let c = 0;
  let alfabeto = Array.from(AFNThompson.getSymbols());

  estadosD = [AFNThompson.cerradura(AFNThompson.inicial)];
  while (estadosD.length) {
    T = estadosD.shift();
    tranD[c] = { estados: T };
    alfabeto.forEach((sim) => {
      U = AFNThompson.cerraduraLista(AFNThompson.mueveLista(T, sim));
      tranD[c][sim] = U;
      if (
        (U.length > 0) &
        !arrayIncludesArray(estadosD, U) &
        !arrayIncludesArray(
          Object.keys(tranD).map((k) => tranD[k].estados),
          U
        )
      ) {
        estadosD.push(U);
      }
    });
    c += 1;
  }
  // Array de estados donde índice es su id
  let idEstados = Object.keys(tranD).map((k) => tranD[k].estados);

  // Encuentra ids de estados inicial y finales tras buscar dentro
  // de los arrays de estados dónde se encuentran estados inicial y finales
  // del AFN
  let inicial;
  let final = [];
  for (let i = 0; i < idEstados.length; i++) {
    if (idEstados[i].includes(AFNThompson.inicial)) {
      inicial = i;
    }
    if (AFNThompson.final.findIndex((s) => idEstados[i].includes(s)) != -1) {
      final.push(i);
    }
  }

  let aristas = [];
  Object.keys(tranD).forEach((k) => {
    // k es un número id del estado
    alfabeto.forEach((sim) => {
      if (tranD[k][sim].length) {
        aristas.push(
          getRenderedEdge(
            idEstados.findIndex((e) =>
              arraysShareAllElements(tranD[k].estados, e)
            ),
            idEstados.findIndex((e) =>
              arraysShareAllElements(tranD[k][sim], e)
            ),
            sim
          )
        );
      }
    });
  });

  return new Automata(idEstados, aristas, inicial, final);
}
