import useAxios from "./useAxios";
import { useState } from "react";

var meslek_choise = [];



export const getJobs = async () => {  
    const [meslekler, setMeslekler] = useState(null);
    useAxios()
    .get(`job/list/`)
    .then((res) => {
        setMeslekler(res.data);                
        if(meslek_choise.length!=0){
            for (var i = 0; i < meslek_choise.length; i++) {
                meslek_choise.splice(i, 1);
            }    
            console.log(meslek_choise);
        }               
        res.data.forEach(function (meslek) {
            debugger;
            meslek_choise.push(meslek.name);
            console.log(meslek_choise);
        });
    });
    console.log(meslekler);
    return meslek_choise;
  };

export default getJobs;