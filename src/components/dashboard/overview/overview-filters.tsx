// overview-table.tsx
import * as React from 'react';

const overviewData = [
  {
    id: 1,
    metrica: "Receita Total",
    valor: "R$ 145.000",
    variacao: "+12.5%",
    periodo: "Maio 2025"
  },
  {
    id: 2,
    metrica: "Novos Usuários", 
    valor: "1.250",
    variacao: "+8.3%",
    periodo: "Maio 2025"
  },
  {
    id: 3,
    metrica: "Taxa Conversão",
    valor: "3.2%",
    variacao: "-2.1%",
    periodo: "Maio 2025"
  }
];

export function OverviewTable(): React.JSX.Element {
  return (
    <div className="overview-table">
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Variação</th>
            <th>Período</th>
          </tr>
        </thead>
        <tbody>
          {overviewData.map((item) => (
            <tr key={item.id}>
              <td>{item.metrica}</td>
              <td>{item.valor}</td>
              <td>{item.variacao}</td>
              <td>{item.periodo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
