// Functions from https://github.com/oasis-open/cti-stix-visualization/blob/6c9269f86dec96246f0262a1c02e04c99ceb9f73/application.js

/**
 * Handle clicks on the visjs graph view.
 *
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 */
export function graphViewClickHandler(event, edgeDataSet, stixIdToObject) {
  if (event.nodes.length > 0) {
    // A click on a node
    let stixObject = stixIdToObject.get(event.nodes[0]);
    if (stixObject)
      populateSelected(stixObject, edgeDataSet, stixIdToObject);
  } else if (event.edges.length > 0) {
    // A click on an edge
    let stixRel = stixIdToObject.get(event.edges[0]);
    if (stixRel)
      populateSelected(stixRel, edgeDataSet, stixIdToObject);
    else
      // Just make something up to show for embedded relationships
      populateSelected(
        new Map([
          ["", "(Embedded relationship)"]
        ]),
        edgeDataSet, stixIdToObject
      );
  }
  // else, just a click on the canvas
}

/**
 * Populate relevant webpage areas according to a particular STIX object.
 *
 * @param stixObject The STIX object to display information about
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 */
function populateSelected(stixObject, edgeDataSet, stixIdToObject) {
  // Remove old values from HTML
  let selectedContainer = document.getElementById('selection');
  selectedContainer.replaceChildren();

  let contentNodes = stixObjectContentToDOMNodes(
    stixObject, edgeDataSet, stixIdToObject, /*topLevel=*/ true
  );
  selectedContainer.append(...contentNodes);

  populateConnections(stixObject, edgeDataSet, stixIdToObject);
}

/**
 * Create a rendering of an object/dictionary as part of rendering an
 * overall STIX object.
 *
 * @param objectContent The object/dictionary to render, as a Map instance
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 * @param topLevel Whether objectContent is itself a whole STIX object,
 *      i.e. the top level of a content tree.  This is used to adjust the
 *      rendering, e.g. omit the surrounding braces at the top level.
 * @return The rendering as an array of DOM elements
 */
function stixObjectContentToDOMNodes(
  objectContent, edgeDataSet, stixIdToObject, topLevel = false
) {
  let nodes = [];

  if (!topLevel)
    nodes.push(document.createTextNode("{"));

  for (let [propName, propValue] of objectContent) {
    let propNameSpan = document.createElement("span");
    propNameSpan.className = "selected-object-prop-name";
    propNameSpan.append(propName + ":");

    let contentNodes;
    if (propName.endsWith("_ref"))
      contentNodes = stixStringContentToDOMNodes(
        propValue, edgeDataSet, stixIdToObject, /*isRef=*/ true
      );
    else if (propName.endsWith("_refs"))
      contentNodes = stixArrayContentToDOMNodes(
        propValue, edgeDataSet, stixIdToObject, /*isRefs=*/ true
      );
    else
      contentNodes = stixContentToDOMNodes(
        propValue, edgeDataSet, stixIdToObject
      );

    let propDiv = document.createElement("div");
    propDiv.append(propNameSpan);
    propDiv.append(...contentNodes);

    if (!topLevel)
      propDiv.className = "selected-object-object-content";

    nodes.push(propDiv);
  }

  if (!topLevel)
    nodes.push(document.createTextNode("}"));

  return nodes;
}

/**
 * Create a rendering of a string value as part of rendering an overall
 * STIX object.
 *
 * @param stringContent The string to render
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 * @param isRef Whether the string is the value of a _ref property.  Used
 *      to produce a distinctive rendering for references.
 * @return The rendering as an array of DOM elements
 */
function stixStringContentToDOMNodes(
  stringContent, edgeDataSet, stixIdToObject, isRef = false
) {
  let nodes = [];

  let spanWrapper = document.createElement("span");
  spanWrapper.append(stringContent);

  if (isRef) {
    let referentObj = stixIdToObject.get(stringContent);
    if (referentObj) {
      spanWrapper.className = "selected-object-text-value-ref";
      spanWrapper.addEventListener(
        "click", e => {
          e.stopPropagation();
          // view.selectNode(referentObj.get("id"));
          populateSelected(
            referentObj, edgeDataSet, stixIdToObject
          );
        }
      );
    } else
      spanWrapper.className = "selected-object-text-value-ref-dangling";
  } else
    spanWrapper.className = "selected-object-text-value";

  nodes.push(spanWrapper);

  return nodes;
}

/**
 * Create a rendering of a value for which no other special rendering
 * applies, as part of rendering an overall STIX object.
 *
 * @param otherContent The content to render
 * @return The rendering as an array of DOM elements
 */
function stixOtherContentToDOMNodes(otherContent) {
  let nodes = [];

  let asText;
  if (otherContent === null)
    asText = "null";
  else if (otherContent === undefined)
    asText = "undefined"; // also just in case??
  else
    asText = otherContent.toString();

  let spanWrapper = document.createElement("span");
  spanWrapper.append(asText);
  spanWrapper.className = "selected-object-nontext-value";
  nodes.push(spanWrapper);

  return nodes;
}

/**
 * Create a rendering of an array as part of rendering an overall STIX
 * object.
 *
 * @param arrayContent The array to render
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 * @param isRefs Whether the array is the value of a _refs property, i.e.
 *      an array of STIX IDs.  Used to produce a distinctive rendering for
 *      references.
 * @return The rendering as an array of DOM elements
 */
function stixArrayContentToDOMNodes(
  arrayContent, edgeDataSet, stixIdToObject, isRefs = false
) {
  let nodes = [];

  let ol = document.createElement("ol");
  ol.className = "selected-object-list";

  for (let elt of arrayContent) {
    let contentNodes;
    if (isRefs)
      contentNodes = stixStringContentToDOMNodes(
        elt, edgeDataSet, stixIdToObject, /*isRef=*/ true
      );
    else
      contentNodes = stixContentToDOMNodes(
        elt, edgeDataSet, stixIdToObject
      );

    let li = document.createElement("li");
    li.append(...contentNodes);
    ol.append(li);
  }

  nodes.push(document.createTextNode("["));
  nodes.push(ol);
  nodes.push(document.createTextNode("]"));

  return nodes;
}

/**
 * Create a rendering of a value, as part of rendering an overall STIX
 * object.  This function dispatches to one of the more specialized
 * rendering functions based on the type of the value.
 *
 * @param stixContent The content to render
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 * @return The rendering as an array of DOM elements
 */
function stixContentToDOMNodes(stixContent, edgeDataSet, stixIdToObject) {
  let nodes;

  if (stixContent instanceof Map)
    nodes = stixObjectContentToDOMNodes(
      stixContent, edgeDataSet, stixIdToObject
    );
  else if (Array.isArray(stixContent))
    nodes = stixArrayContentToDOMNodes(
      stixContent, edgeDataSet, stixIdToObject
    );
  else if (
    typeof stixContent === "string" || stixContent instanceof String
  )
    nodes = stixStringContentToDOMNodes(
      stixContent, edgeDataSet, stixIdToObject
    );
  else
    nodes = stixOtherContentToDOMNodes(stixContent);

  return nodes;
}

/**
 * Populate the Linked Nodes box with the connections of the given STIX
 * object.
 *
 * @param stixObject The STIX object to display connection information
 *      about
 * @param edgeDataSet A visjs DataSet instance with graph edge data derived
 *      from STIX content
 * @param stixIdToObject A Map instance mapping STIX IDs to STIX objects as
 *      Maps, containing STIX content.
 */
function populateConnections(stixObject, edgeDataSet, stixIdToObject) {
  let objId = stixObject.get("id");

  let edges = edgeDataSet.get({
    filter: item => (item.from === objId || item.to === objId)
  });

  let eltConnIncoming = document.getElementById("connections-incoming");
  let eltConnOutgoing = document.getElementById("connections-outgoing");

  eltConnIncoming.replaceChildren();
  eltConnOutgoing.replaceChildren();

  let listIn = document.createElement("ol");
  let listOut = document.createElement("ol");

  eltConnIncoming.append(listIn);
  eltConnOutgoing.append(listOut);

  for (let edge of edges) {
    let targetList;
    let summaryNode = document.createElement("summary");
    let otherEndSpan = document.createElement("span");
    let otherEndObj;

    if (objId === edge.from) {
      otherEndObj = stixIdToObject.get(edge.to);
      otherEndSpan.append(otherEndObj.get("type"));

      summaryNode.append(edge.label + " ");
      summaryNode.append(otherEndSpan);

      targetList = listOut;
    } else {
      otherEndObj = stixIdToObject.get(edge.from);
      otherEndSpan.append(otherEndObj.get("type"));

      summaryNode.append(otherEndSpan);
      summaryNode.append(" " + edge.label);

      targetList = listIn;
    }

    otherEndSpan.className = "selected-object-text-value-ref";
    otherEndSpan.addEventListener(
      "click", e => {
        // view.selectNode(otherEndObj.get("id"));
        populateSelected(otherEndObj, edgeDataSet, stixIdToObject);
      }
    );

    let li = document.createElement("li");
    let detailsNode = document.createElement("details");

    targetList.append(li);
    li.append(detailsNode);
    detailsNode.append(summaryNode);

    let objRenderNodes = stixObjectContentToDOMNodes(
      otherEndObj, edgeDataSet, stixIdToObject, /*topLevel=*/ true
    );
    detailsNode.append(...objRenderNodes);
  }
}
