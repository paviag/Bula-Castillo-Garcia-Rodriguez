import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import "../styles.css";
import Graph from "./Graph";

function StatesTable({ dataTabla, alfabeto, nombre }) {
  /**
   * Componente para la tabla de transiciones
   */

  // comp es un estado que es inicial y final al mismo tiempo
  let comp;
  if (dataTabla.data.final?.includes(dataTabla.data.inicial)) {
    comp = dataTabla.data.inicial;
  }

  return (
    <div className="table-container">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              {Array.from(alfabeto).map((s) => {
                return (
                  <TableCell key={nombre + s} align="right">
                    {s}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(dataTabla)
              .filter((k) => k != "data")
              .sort((a, b) => a - b)
              .map((estado) => {
                return (
                  <TableRow key={"tablerow" + nombre + estado}>
                    <TableCell key={"tablecell" + nombre + estado}>
                      {comp == parseInt(estado)
                        ? "→✽" + estado
                        : dataTabla.data.inicial == parseInt(estado)
                        ? "→" + estado
                        : dataTabla.data.final.includes(parseInt(estado))
                        ? "✽" + estado
                        : estado}
                    </TableCell>
                    {Array.from(alfabeto).map((s) => {
                      return (
                        <TableCell
                          key={"tablecell" + nombre + estado + s}
                          align="right"
                        >
                          {dataTabla[estado][s]
                            ? "{" + dataTabla[estado][s].join(", ") + "}"
                            : "{}"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function SignStatesTable({ nodosEstados, estSign }) {
  /**
   * Componente para la tabla de estados significativos
   */

  // Obtiene el Subconjunto de Estados Significativos de cada Subconjunto
  // de Estados del AFN
  let nodosEstadosSign = nodosEstados.map((listaEst) => {
    return [listaEst, listaEst.filter((e) => estSign.includes(e))];
  });

  return (
    <div className="table-container">
      <h3>Conjunto de Estados Significativos</h3>
      <p>{"{" + estSign.join(",") + "}"}</p>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estado de AFD No Óptimo</TableCell>
              <TableCell>Subconjunto de Estados del AFN</TableCell>
              <TableCell>Subconjunto de Estados Significativos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodosEstadosSign.map((lis, id) => {
              return (
                <TableRow key={"tablerow-nodosestados-" + id}>
                  <TableCell key={"tablecell-id-" + id}>{id}</TableCell>
                  <TableCell key={"tablecell-estafn-" + id} align="right">
                    {"{" + lis[0].join(",") + "}"}
                  </TableCell>
                  <TableCell key={"tablecell-estsig-" + id} align="right">
                    {"{" + lis[1].join(",") + "}"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function MethodSection({ nombre, automata }) {
  /**
   * Componente para una sección de método que contiene
   * título, grafo y tabla de transiciones
   */
  return (
    <>
      <h2>Método de {nombre}</h2>
      <Graph elementos={automata.getRenderedElements()} />
      <StatesTable
        dataTabla={automata.getStatesTableData()}
        alfabeto={automata.getSymbols()}
        nombre={nombre}
      />
    </>
  );
}

function AlphabetSection({ data }) {
  /**
   * Componente para mostrar un alfabeto
   */
  return (
    <>
      <h2>Alfabeto</h2>
      <p>{"{" + Array.from(data).join(",") + "}"}</p>
    </>
  );
}

export default function Parte1({ thompsonAFN, subconjAFD, estSigAFD }) {
  /**
   * Componente para la Parte 1 de construcción de autómatas
   */
  return (
    <>
      <h1>Construcción de autómatas</h1>
      <MethodSection nombre="Thompson" automata={thompsonAFN} />
      <AlphabetSection data={thompsonAFN.getSymbols()} />
      <MethodSection nombre="Subconjuntos" automata={subconjAFD} />
      <MethodSection nombre="Estados Significativos" automata={estSigAFD} />
      <SignStatesTable
        nodosEstados={subconjAFD.nodosEstados}
        estSign={thompsonAFN.getEstadosSignificativos()}
      />
    </>
  );
}
