import React from "react";
import cx from "classnames";
import styles from "./list-item.module.scss";

// A React component representing an item in the list to be rendered.
export const ListItem = function ({
  selected = false,
  serial,
  value,
  onChange,
}) {
  // componse a class string to assign to the list item element based on props
  const itemCx = cx(styles["list-item"], { [styles["selected"]]: selected });

  return (
    <li className={itemCx}>
      <input
        checked={selected}
        className={styles["checkbox"]}
        data-serial={serial}
        onChange={onChange}
        type="checkbox"
      />
      <span>{value}</span>
    </li>
  );
};
