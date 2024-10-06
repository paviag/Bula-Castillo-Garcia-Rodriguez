import { getRenderedEdge, addConcatOp, adjustedStateLabels } from "./Extras";
import Automata from "./Automata";

function getOperationsQueue(regex) {
  /**
   * Retorna la pila de operaciones a realizar para
   * ir construyendo el autómata finito no determinístico
   * por medio del método de Thompson
   */
  if (!regex.length) {
    return [];
  }
  regex = addConcatOp(regex);
  // Define orden de precedencia para la pila de operaciones
  let PRI_SYM = {
    "|": 0,
    ".": 1,
    "*": 2,
    "+": 3,
    "?": 4,
    "(": -1,
    ")": -1,
  };
  // Genera una pila con los símbolos y operadores en el orden de precedencia adecuado
  let pila = [];
  let pilaop = [];
  let c;
  // Recorre la regex modificada con los operadores de concatenación

  for (let i = 0; i < regex.length; i++) {
    c = regex[i];
    if (c == ")") {
      // Si el caracter actual es un paréntesis de cierre, los operadores
      // de pilaop se sacan e insertan en la pila hasta encontrar el paréntesis
      // de inicio
      while (pilaop[pilaop.length - 1] != "(") {
        pila.push(pilaop.pop());
      }
      pilaop.pop(); // Elimina paréntesis de inicio
    } else if (c == "(") {
      // Si el caracter actual es un paréntesis de inicio, se añade a
      // pilaop sin más
      pilaop.push(c);
    } else if (Object.keys(PRI_SYM).includes(c)) {
      // Si el caracter es alguno de los otros símbolos, se evalua su precedencia
      // con respecto al último operador en pilaop. Los operadores se van sacando
      // de pilaop e insertando a pila hasta que se encuentre un operador de menor
      // precedencia
      while (
        pilaop.length &
        (PRI_SYM[pilaop[pilaop.length - 1]] >= PRI_SYM[c] ||
          (c == "|") & (pilaop[pilaop.length - 1] == "."))
      ) {
        pila.push(pilaop.pop());
      }
      // Se añade el nuevo caracter a la pil
      if (["*", "+", "?"].includes(c)) {
        pila.push(c);
      } else {
        pilaop.push(c);
      }
    } else {
      // Si el caracter es un símbolo, se añade sin más a la pila
      pila.push(c);
    }
  }

  // Una vez evaluada toda la expresión, se van sacando e insertando a la pila
  // los operadores que quedaron en pilaop
  while (pilaop.length) {
    pila.push(pilaop.pop());
  }

  // Se retorna la pila resultante
  return pila;
}

export default function AFNThompson(regex) {
  /**
   * Retorna el autómata finito determinístico generado por el método de
   * Thompson partiendo de una expresión regular de entrada
   */
  let pila = getOperationsQueue(regex);
  let v = [];
  let aristas = [];
  let nodos = [];
  let count = 0;
  let nuevo, aux, a, inicial, final;
  pila.forEach((c) => {
    if (c == ".") {
      // v[-2][1] hereda aristas de v[-1][0], uniendo así las últimas
      // dos conexiones de v de forma que se elimine v[-1][0]
      nuevo = []; // Nuevas aristas tras la herencia
      aux = []; // Lista de índices a eliminar de lista de aristas
      for (let j = 0; j < aristas.length; j++) {
        a = aristas[j];
        // Si la fuente o destino de la arista es v[-1][0]
        // (nodo a eliminar), esta arista será reemplazada por
        // otra con los mismos atributos pero que reemplace a
        // v[-1][0] por v[-2][1]
        if (a.data.source == v[v.length - 1][0]) {
          nuevo.push(
            getRenderedEdge(v[v.length - 2][1], a.data.target, a.data.label)
          );
          aux.push(j);
        } else if (a.data.target == v[v.length - 1][0]) {
          // TODO: revisar si esto sucede
          nuevo.push(
            getRenderedEdge(a.data.source, v[v.length - 2][1], a.data.label)
          );
          aux.push(j);
        }
      }
      // Elimina nodo v[-1][0]
      nodos.splice(nodos.indexOf(v[v.length - 1][0]), 1);
      // Elimina links de nodo v[-1][0] (con índices almacenados
      // en aux)
      for (let j = 0; j < aux.length; j++) {
        aristas.splice(aux[j] - j, 1);
      }
      // Añade nuevos links (contenidos en nuevo)
      aristas = aristas.concat(nuevo);
      // Conecta últimas 2 conexiones de v en 1 sola
      // (unida por concatenación)
      v[v.length - 2][1] = v[v.length - 1][1];
      v.pop();
    } else if (c == "|") {
      // Añade aristas correspondientes
      aristas = aristas.concat([
        getRenderedEdge(count, v[v.length - 2][0], "&"),
        getRenderedEdge(count, v[v.length - 1][0], "&"),
        getRenderedEdge(v[v.length - 2][1], count + 1, "&"),
        getRenderedEdge(v[v.length - 1][1], count + 1, "&"),
      ]);
      // Conecta últimas 2 aristas en 1 conexión
      v.pop();
      v.pop();
      v.push([count, count + 1]);
      // Añade 2 nodos count y count+1
      nodos = nodos.concat([count, count + 1]);
    } else if (["*", "+"].includes(c)) {
      // Añade aristas pertinentes
      aristas = aristas.concat([
        getRenderedEdge(count, v[v.length - 1][0], "&"),
        getRenderedEdge(v[v.length - 1][1], count + 1, "&"),
        getRenderedEdge(v[v.length - 1][1], v[v.length - 1][0], "&"), // arista curva
      ]);

      if (c == "*") {
        // Añade arista de nuevo inicio a nuevo fin con épsilon
        aristas.push(getRenderedEdge(count, count + 1, "&")); // arista curva
      }

      v.pop();
      v.push([count, count + 1]);

      // Añade nuevos nodos count y count+1
      nodos = nodos.concat([count, count + 1]);
    } else if (c == "?") {
      // Añade aristas pertinentes
      aristas = aristas.concat([
        getRenderedEdge(count, v[v.length - 1][0], "&"),
        getRenderedEdge(v[v.length - 1][1], count + 1, "&"),
        getRenderedEdge(count, count + 1, "&"), // arista curva
      ]);

      // Fusiona últimas 2 conexiones en una sola
      v.pop();
      v.push([count, count + 1]);

      // Añade nuevos nodos count y count+1
      nodos = nodos.concat([count, count + 1]);
    } else {
      // Añade arista con c entre 2 nuevos nodos
      aristas.push(getRenderedEdge(count, count + 1, c));
      // Añade nueva conexión entre 2 nuevos nodos
      v.push([count, count + 1]);
      // Añade nuevos nodos count y count+1
      nodos = nodos.concat([count, count + 1]);
    }
    count += 2;
  });

  if (v.length) {
    // Obtiene estados inicial y final
    inicial = v[v.length - 1][0];
    final = v[v.length - 1][1];

    // Ajusta etiquetas
    let etiquetasAjustadas = adjustedStateLabels(nodos, aristas);

    aristas.forEach((a) => {
      a.data.source = etiquetasAjustadas[a.data.source];
      a.data.target = etiquetasAjustadas[a.data.target];
    });
    nodos = Object.values(etiquetasAjustadas);

    inicial = etiquetasAjustadas[inicial];
    final = etiquetasAjustadas[final];
  }

  return new Automata(nodos, aristas, inicial, [final]);
}
