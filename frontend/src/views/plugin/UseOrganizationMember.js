import { useState, useEffect } from "react";
import useAxios from "../../utils/useAxios";

function UseOrganizationMember() {
    let members;
    // const [members, setMembers] = useState([]);
    
    useAxios()
    .get(`admin/organizationchart/`)
    .then((res) => {
         
         members = res.data;               
        // setMembers(res.data);
        // console.log(members);
    });
    return members;
}
export default UseOrganizationMember

