import React, { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import Spinner from "../Spinner/Spinner";

function HafizBilgiCreate() {
    const [hafizBilgi, setHafizBilgi] = useState({
      yas: 0,
      name: "",
      decription: "",
      os: ""     
    });

}