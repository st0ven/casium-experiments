import { container } from "casium";
import { SortableListView } from "./_view";
import {
  reorderList,
  resetList,
  toggleItemSelection,
  ReorderListMsg,
  ResetListMsg,
  ToggleItemSelectionMsg,
} from "./_updaters";

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
    [ReorderListMsg, reorderList],
    [ResetListMsg, resetList],
    [ToggleItemSelectionMsg, toggleItemSelection],
  ],

  view: SortableListView,
});
