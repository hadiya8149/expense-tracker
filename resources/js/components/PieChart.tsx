import { Pie } from "react-chartjs-2";

export default function PieChart({...props}) {

  return (
    <div className="chart-container">
      <Pie
    // redraw={true}
data={props.data}
        options={{
            responsive:false,

          plugins: {
            title: {
              display: true,
              text: "Amount spend in each label"
            },
            legend:{
                position:'left',
                display:true,
            }
          }
        }}
      />
    </div>
  );
}