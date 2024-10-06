import { arraysShareAllElements } from "./Extras";
import Automata from "./Automata";

export default function AFDEstSign(AFNThompson, AFDNoOpt) {
  /**
   * Retorna el AFD por método de Estados Significativos partiendo
   * del AFN de Thompson y el AFD No Óptimo de entrada
   */
  if (!AFNThompson | !AFDNoOpt | !AFDNoOpt.nodosEstados) {
    // Retorna nulo si no puede desarrollarse el método por falta de parámetros
    return null;
  }
  // Obtiene los estados significativos
  let estSign = AFNThompson.getEstadosSignificativos();
  // Obtiene los estados significativos de cada estado del AFD No Óptimo
  // en términos de los subconjuntos de estados del AFN
  let nodosEstadosSign = AFDNoOpt.nodosEstados.map((listaEst) => {
    return listaEst.filter((e) => estSign.includes(e));
  });
  // Obtiene los estados "equivalentes", es decir, que contienen en sus
  // subconjuntos de estados del AFN los mismos estados significativos.
  // estEquivalentes es un array que contiene arrays. Cada sub-array contiene
  // estados equivalentes entre sí. Solo el primero de cada array de estados
  // se conservará.
  let estEquivalentes = [];
  for (let i = 0; i < AFDNoOpt.nodos.length; i++) {
    // Si el estado a evaluar (i) ya está en estEquivalentes, no hay que volverlo
    // a evaluar porque se sabe su equivalencia con un estado ya evaluado
    if (estEquivalentes.flat().includes(i)) {
      continue;
    }
    // Si no se ha encontrado su equivalencia, se crea un nuevo array
    // empezando por el estado que se está evaluando (i)
    estEquivalentes.push([i]);
    // Se compara el estado actual (i) con los estados siguientes (j)
    for (let j = i + 1; j < AFDNoOpt.nodos.length; j++) {
      // Si los estados comparten todos sus subconjuntos de estados
      // significativos, entonces hay equivalencia, por lo que se añade el
      // estado j al último array
      if (arraysShareAllElements(nodosEstadosSign[i], nodosEstadosSign[j])) {
        estEquivalentes[estEquivalentes.length - 1].push(j);
      }
    }
    // Si no se encontraron estados equivalentes para el estado actual i
    // se elimina el último array añadido a estEquivalentes, que solo
    // contiene a i
    if (estEquivalentes[estEquivalentes.length - 1].length == 1) {
      estEquivalentes.pop();
    }
  }

  // Se crean los elementos del nuevo AFD a crear partiendo del AFD No Óptimo
  let nuevosNodos = [...AFDNoOpt.nodos];
  let nuevasAristas = JSON.parse(JSON.stringify(AFDNoOpt.aristas));
  let nuevoFinal = [...AFDNoOpt.final];
  for (let i = 0; i < estEquivalentes.length; i++) {
    // Por cada array de estados equivalentes, el primer elemento del array
    // adopta a los siguientes, es decir, que este permanecerá y los
    // demás serán eliminados y reemplazados por el primero
    estEquivalentes[i].slice(1).forEach((e) => {
      // Por cada elemento a eliminar y reemplazar:
      // Se elimina estado del array de nuevos nodos
      nuevosNodos.splice(nuevosNodos.indexOf(e), 1);
      // Se actualizan estados finales
      let k = nuevoFinal.indexOf(e);
      if (k != -1) {
        // Si el nodo que va a eliminarse era un estado final, entonces el
        // nodo que permanecerá debe incluirse en los nuevos estados
        // finales (si aún no lo está), y el que va a eliminarse debe
        // eliminarse de los nuevos estados finales
        nuevoFinal.splice(k, 1);
        if (!nuevoFinal.includes(estEquivalentes[i][0])) {
          nuevoFinal.push(estEquivalentes[i][0]);
        }
      }
    });
    // Se excluyen en las nuevas aristas aquellas que partan desde los nodos eliminados
    nuevasAristas = nuevasAristas.filter(
      (a) => !estEquivalentes[i].slice(1).includes(parseInt(a.data.source))
    );
    // Se reemplazan en las nuevas aristas los nodos eliminados por sus respectivos
    // estados equivalentes que permanecen en el AFD óptimo
    nuevasAristas.forEach((a) => {
      if (estEquivalentes[i].slice(1).includes(parseInt(a.data.source))) {
        a.data.source = estEquivalentes[i][0];
      } else if (
        estEquivalentes[i].slice(1).includes(parseInt(a.data.target))
      ) {
        a.data.target = estEquivalentes[i][0];
      }
    });
    console.log("est sign");
    console.log(nuevasAristas);
  }

  return new Automata(nuevosNodos, nuevasAristas, AFDNoOpt.inicial, nuevoFinal);
}
