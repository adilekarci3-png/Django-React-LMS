import React from "react";
// import MenuBlock from "./MenuBlock"; // ya da doğru yol neyse oradan import et

const renderMenuByRole = (roleData) => {
  if (!roleData) return null;

  const { base_role, sub_roles } = roleData;

  if (base_role === "Teacher" && sub_roles.includes("HDMTeacher")) {
    return (
      <MenuBlock title="HDM Eğitmen Paneli" items={[
        { label: "Hafızlarım", path: "/hdm/teacher/hafizlar" },
        { label: "Ders Atamaları", path: "/hdm/teacher/ders-atama" },
      ]} />
    );
  }

  if (base_role === "Hafiz" && sub_roles.includes("HDMHafiz")) {
    return (
      <MenuBlock title="HDM Hafız Paneli" items={[
        { label: "Derslerim", path: "/hdm/hafiz/dersler" },
        { label: "Okumalarım", path: "/hdm/hafiz/okumalar" },
      ]} />
    );
  }

  if (base_role === "Koordinator" && sub_roles.includes("HDMKoordinator")) {
    return (
      <MenuBlock title="HDM Koordinatör Paneli" items={[
        { label: "Eğitmenler", path: "/hdm/koordinator/egitmenler" },
        { label: "Hafızlar", path: "/hdm/koordinator/hafizlar" },
      ]} />
    );
  }

  if (base_role === "Teacher" && sub_roles.includes("HBSEgitmen")) {
    return (
      <MenuBlock title="HBS Eğitmen Paneli" items={[
        { label: "Hafızlarım", path: "/hbs/teacher/hafizlar" }
      ]} />
    );
  }

  return null;
};

export default renderMenuByRole;
