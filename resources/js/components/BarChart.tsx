
import { Bar } from "react-chartjs-2";
export default function BarChart({...props}) {

  return (
    <div className="chart-container">
      <p className="card-title" style={{ textAlign: "center" }}>Bar Chart</p>
      <Bar
        data={props.data}

      />
    </div>
  );
}