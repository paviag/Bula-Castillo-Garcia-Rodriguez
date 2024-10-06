export default class Automata {
  constructor(nodos, aristas, inicial, final) {
    if ((nodos.length > 0) & !(typeof nodos[0] == "number")) {
      this.nodos = [...Array(nodos.length).keys()];
      this.nodosEstados = nodos;
    } else {
      this.nodos = nodos;
      this.nodosEstados = null;
    }
    this.aristas = aristas;
    this.inicial = inicial;
    this.final = final;
  }

  getSymbols() {
    /**
     * Retorna conjunto de símbolos del alfabeto
     */
    let symbolSet = new Set(this.aristas.map((a) => a.data.label));
    symbolSet.delete("&");
    return symbolSet;
  }

  getRenderedElements() {
    /**
     * Retorna la lista de elementos del grafo (nodos+aristas) en el
     * formato requerido para graficarlos con CytoscapeComponent
     */
    // nodos estructura:
    // {data: {id: x, label: z, ...} }

    // aristas estructura:
    // {data: {source: x, target: y, label: z, ...} }
    let nodosRender = this.nodosEstados
      ? this.nodosEstados.map((le, id) => {
          return {
            data: {
              id: id,
              label: id,
              tooltip: {
                title: "Estados",
                content: `{${le.join(",")}}`,
              },
              borderColor: "black",
              borderWidth: this.final.includes(id) ? "5px" : "2px",
              borderStyle: this.final.includes(id) ? "double" : "solid",
            },
          };
        })
      : this.nodos.map((n) => {
          return {
            data: {
              id: n,
              label: n,
              borderColor: "black",
              borderWidth: this.final.includes(n) ? "5px" : "2px",
              borderStyle: this.final.includes(n) ? "double" : "solid",
            },
          };
        });
    return [
      ...nodosRender,
      ...JSON.parse(JSON.stringify(this.aristas)),
      {
        data: {
          id: "i",
          label: "",
          borderWidth: "0",
          borderStyle: "solid",
          borderColor: "black",
        },
      },
      {
        data: {
          source: "i",
          target: this.inicial,
          label: "inicio",
          lineColor: "black",
        },
      },
    ];
  }

  getStatesTableData() {
    /**
     * Retorna los datos de la tabla de transiciones. Estos datos
     * están en forma de diccionario cuyas llaves son estados y
     * cuyos valores son a su vez diccionarios con símbolos del
     * alfabeto como llaves y conjuntos de estados como valores.
     * Además indica estados de inicio y fin.
     */
    let table = {};
    this.aristas.forEach((a) => {
      if (table[a.data.source]) {
        if (table[a.data.source][a.data.label]) {
          table[a.data.source][a.data.label].push(a.data.target);
        } else {
          table[a.data.source][a.data.label] = [a.data.target];
        }
      } else {
        table[a.data.source] = {};
        table[a.data.source][a.data.label] = [a.data.target];
      }
    });

    this.final
      .filter((f) => !Object.keys(table).includes(f.toString()))
      .forEach((rf) => {
        table[rf] = {};
      });

    table.data = { inicial: this.inicial, final: this.final };

    return table;
  }

  cerradura(src) {
    /**
     * Retorna la cerradura del estado "src" en forma de array
     * (array de estados alcanzables desde "src" con épsilon "&")
     */
    let cola = [src];
    let visitado = {};
    this.nodos.forEach((n) => {
      visitado[n] = false;
    });
    visitado[src] = true;
    let nodosAlcanzables = [];
    let u;
    while (cola.length) {
      u = cola.shift();
      nodosAlcanzables.push(u);
      this.mueve(u, "&")
        .filter((e) => !visitado[e])
        .forEach((e) => {
          visitado[e] = true;
          cola.push(e);
        });
    }
    return nodosAlcanzables;
  }

  mueve(estado, simbolo) {
    /**
     * Retorna un array con el resultado de aplicar mueve con el
     * estado y símbolo de entrada
     */
    return this.getStatesTableData()[estado][simbolo] ?? [];
  }

  mueveLista(listaEstados, simbolo) {
    /**
     * Retorna el resultado de aplicar mueve para una LISTA de
     * estados con el símbolo de entrada
     */
    let mueve = [];
    listaEstados.forEach((e) => {
      mueve = mueve.concat(this.mueve(e, simbolo));
    });
    return mueve;
  }

  cerraduraLista(listaEstados) {
    /**
     * Retorna el resultado de la cerradura de una LISTA de
     * estados
     */
    let cerr = new Set();
    listaEstados.forEach((e) => {
      this.cerradura(e).forEach((ce) => cerr.add(ce));
    });
    return Array.from(cerr);
  }

  getEstadosSignificativos(includeFinal = true) {
    /**
     * Retorna un array de los estados significativos,
     * incluyendo o no los estados finales
     */

    let estSign = new Set(
      this.aristas.filter((a) => a.data.label != "&").map((a) => a.data.source)
    );
    return Array.from(estSign).concat(includeFinal ? this.final : []);
  }
}
