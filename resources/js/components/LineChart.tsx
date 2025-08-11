
import { Line } from 'react-chartjs-2';
export default function BarChart({...props}) {

  return (
    <div className="chart-container">
      <Line
        data={props.data}

      />
    </div>
  );
}