import React from "react";
import { container } from "casium";
import styles from "./sortable-list.module.scss";
import { ListItem } from "../components/list-item";
import {
  reorderListCommand,
  resetListOrderCommand,
  toggleItemSelectionCommand,
  ReorderList,
  ResetListOrder,
  ToggleItemSelection,
} from "./sortable-list.commands";

// Sortable List Component defined as a Casium Container
export const SortableList = container({
  name: "SortableList",

  init: function () {
    return {
      items: [],
      order: undefined,
      replaceIndex: undefined,
      selectedItems: [],
    };
  },

  update: [
    reorderListCommand,
    resetListOrderCommand,
    toggleItemSelectionCommand,
  ],

  view: function ({ emit, items = [], order, selectedItems }) {
    // Derive a collection of item elements to render in the ordered list.
    const listItemElements = (order || Object.keys(items)).map(
      function renderItem(index) {
        // a reference to the text value of the item to be displayed in the list
        const itemValue = items[index];

        // a unique index which references the original sort order of the item
        // in the original items list prop. This is used to keep a consistent reference
        // to this binding of react element and list item data.
        const itemIndex = items.indexOf(itemValue);

        // Derive the checked state of the corresponding input element of this component.
        const isSelected = selectedItems.includes(itemIndex);

        // JSX to be rendered/injected
        return (
          <ListItem
            key={`list-item-${itemIndex}`}
            onChange={emit([ToggleItemSelection])}
            selected={isSelected}
            serial={itemIndex}
            value={itemValue}
          />
        );
      }
    );

    // Render the list with action buttons
    return (
      <React.Fragment>
        <ul className={styles["sortable-list"]}>{listItemElements}</ul>
        <div className={styles["button-group"]}>
          <button
            disabled={!selectedItems.length}
            onClick={emit([ReorderList, { direction: "up" }])}
          >
            move up
          </button>
          <button
            disabled={!selectedItems.length}
            onClick={emit([ReorderList, { direction: "down" }])}
          >
            move down
          </button>
          <button
            disabled={!order && !selectedItems.length}
            onClick={emit(ResetListOrder)}
          >
            reset
          </button>
        </div>
      </React.Fragment>
    );
  },
});
