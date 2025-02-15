import React, { Fragment, useEffect, useState } from "react";
import "./finalresult.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const critOptions = {
  responsive: true,
  plugins: {
    legend: {
        display:false,
      position: 'top',
    },
    title: {
      display: true,
      position:'top' ,
      text: "Criteria Priorities",
    },
  },
};
export const altOptions = {
    responsive: true,
    plugins: {
      legend: {
        display:false,
        position: 'top',
      },
      title: {
        display: true,
        position:'top',
        text: "Alternative Priorities",
      },
    },
  };



function CreateTable({ data1, data2, name1, name2 }) {
  console.log(data1, data2);
  // console.log(name1, name2);
  const critSize = data1.length,
    altSize = data2.length / data1.length;

  let finalPriorityVector = new Array(altSize);
  finalPriorityVector.fill(0);

  for (let i = 0; i < altSize; i++) {
    let index = i;
    for (let j = 0; j < critSize; j++) {
      finalPriorityVector[i] += data1[j] * data2[index];
      index += altSize;
    }
  }
//   console.log(finalPriorityVector);
  let maxPriority = Math.max(...finalPriorityVector);
  let maxPriorityName;
  let index = 0;

  for (let altPriority in finalPriorityVector) {
    if (maxPriority === finalPriorityVector[altPriority]) {
      maxPriorityName = name2[index];
    }
    index++;
  }
  
  const altChartName = name2.slice(0, altSize);

  let labels = [...altChartName];
  
   const altChartData = {
    labels,
    datasets: [
      {
        fill: true,
        data: [...finalPriorityVector],
        borderColor: "rgb(45, 179, 0)",
        backgroundColor: "rgba(64, 255, 0, 0.3)",
      
      },
    ],
  };
  labels = [...name1]
  const critChartData = {
    labels,
    datasets: [
      {
        fill: true,
        data: [...data1],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      
      },
    ],
  };


  return (<div className="p-6" >
    <div className=" flex flex-col items-center justify-center ">
      <div className=" text-neutral-700 mx-36 my-10 justify-center text-xl">
        The Alternative that should be considered finally according to the
        process of AHP is {<b className="text-lime-600">{maxPriorityName}</b>}{" "}
        with a Final Priority Score of{" "}
        {<b className="text-lime-600">{maxPriority}</b>}{" "}
      </div>
      
    </div>
    <div className="px-44  chartCenter "><Line options={altOptions} data={altChartData} /></div>
    <hr/>
    <div className="px-44 chartCenter"><Line options={critOptions} data={critChartData} /></div>
    </div>
  );
}

export default function FinalResult() {
  const [showResult, setShowResult] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [renderData, setRenderData] = useState({
    critResponse: null,
    altResponse: null,
  });
  useEffect(() => {
    async function fetchCritAlt() {
      try {
        const [critR, altR] = await Promise.all([
          fetch("http://127.0.0.1:8000/dataHandle/criteriaEigen/add/", {
            method: "GET",
          }),
          fetch("http://127.0.0.1:8000/dataHandle/alternativeEigen/add/", {
            method: "GET",
          }),
        ]);

        const critResponse = await critR.json();
        const altResponse = await altR.json();
        setRenderData({ critResponse, altResponse });

      } catch (error) {
        console.error(error);
      }
    }
    fetchCritAlt();
  }, [trigger]);

  const handleShowResult = () => {
    let num = trigger;
    num++;
    setTrigger(num);

    setShowResult(!showResult);
  };

  if (showResult) {
    
    let critArray = new Array();
    let critName = new Array();
    let altArray = new Array();
    let altName = new Array();
    for (let [key, value] in renderData.critResponse) {

      critArray.push(Number(renderData.critResponse[key]["value"]));
      critName.push(renderData.critResponse[key]["fieldName"]);
    }
    for (let key in renderData.altResponse) {
      altArray.push(Number(renderData.altResponse[key]["value"]));
      altName.push(renderData.altResponse[key]["fieldName"]);
    }

    return (
      <div
        className=" mx-2 my-2 rounded border-2" >
        <div>
          {
            <CreateTable
              data1={critArray}
              data2={altArray}
              name1={critName}
              name2={altName}
            />
          }
        </div>
      </div>
    );
  } else {
    return (
      <div className="mx-auto my-2 p-36 textClass rounded border-2">
        {/* <createTable /> */}
        <div className="text-5xl">
          After ensuring the data is consistent please click on Get the Final
          Result
        </div>
        {/* <div className="p-auto"> */}
        <button
          type="button"
          className="mt-8 text-4xl mb-4 buttonConfirm rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={handleShowResult}
        >
          Get the Final Result
        </button>
        {/* {renderData.critData && renderData.altData && (<CreateTable  data1={renderData.critData} data2={renderData.altData}/>)} */}
        {/* </div> */}
      </div>
    );
  }
}
