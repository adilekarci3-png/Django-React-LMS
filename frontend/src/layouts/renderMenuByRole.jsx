import React from "react";
import MenuBlock from "./MenuBlock";

const renderMenuByRole = (roleData) => {
  if (!roleData) return null;

  const { base_roles = [], sub_roles = [] } = roleData;
  const menuBlocks = [];

  // HDM Eğitmen
  if (base_roles.includes("Teacher") && sub_roles.includes("HDMEgitmen")) {
    menuBlocks.push(
      <MenuBlock key="hdm-egitmen" title="HDM Eğitmen Paneli" items={[
        { label: "Hafızlarım", path: "/hdm/teacher/hafizlar" },
        { label: "Ders Atamaları", path: "/hdm/teacher/ders-atama" },
      ]} />
    );
  }

  // HBS Eğitmen
  if (base_roles.includes("Teacher") && sub_roles.includes("HBSEgitmen")) {
    menuBlocks.push(
      <MenuBlock key="hbs-egitmen" title="HBS Eğitmen Paneli" items={[
        { label: "Hafızlarım", path: "/hbs/teacher/hafizlar" },
      ]} />
    );
  }

  // Akademi Eğitmen
  if (base_roles.includes("Teacher") && sub_roles.includes("AkademiEgitmen")) {
    menuBlocks.push(
      <MenuBlock key="akademi-egitmen" title="Akademi Eğitmen Paneli" items={[
        { label: "Panel", path: "/akademi/teacher/panel" },
      ]} />
    );
  }

  // HDM Koordinatör
  if (base_roles.includes("Koordinator") && sub_roles.includes("HDMKoordinator")) {
    menuBlocks.push(
      <MenuBlock key="hdm-koordinator" title="HDM Koordinatör Paneli" items={[
        { label: "Eğitmenler", path: "/hdm/koordinator/egitmenler" },
        { label: "Hafızlar", path: "/hdm/koordinator/hafizlar" },
      ]} />
    );
  }

  // ESKEP Eğitmen
  if (base_roles.includes("Teacher") && sub_roles.includes("ESKEPEgitmen")) {
    menuBlocks.push(
      <MenuBlock key="eskep-egitmen" title="ESKEP Eğitmen Paneli" items={[
        { label: "Panel", path: "/eskep/teacher/panel" },
      ]} />
    );
  }

  // HBS Koordinatör
  if (base_roles.includes("Koordinator") && sub_roles.includes("HBSKoordinator")) {
    menuBlocks.push(
      <MenuBlock key="hbs-koordinator" title="HBS Koordinatör Paneli" items={[
        { label: "Eğitmenler", path: "/hbs/koordinator/egitmenler" },
      ]} />
    );
  }

  // Hafız panelleri
  if (base_roles.includes("Hafiz") && sub_roles.includes("HDMHafiz")) {
    menuBlocks.push(
      <MenuBlock key="hdm-hafiz" title="HDM Hafız Paneli" items={[
        { label: "Derslerim", path: "/hdm/hafiz/dersler" },
        { label: "Okumalarım", path: "/hdm/hafiz/okumalar" },
      ]} />
    );
  }

  return menuBlocks.length > 0 ? menuBlocks : null;
};

export default renderMenuByRole;
