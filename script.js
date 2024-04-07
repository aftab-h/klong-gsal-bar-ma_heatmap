document.addEventListener("DOMContentLoaded", function () {
  const lsCorpusContainer = document.getElementById("ls-text");
  const tTextContainer = document.getElementById("t-text");
  const contextMenu = document.getElementById("customContextMenu");
  console.log("test");

  // Load HTML's
  fetchAndLoadData("key_and_data/highlighted_ls_text.html", lsCorpusContainer);
  fetchAndLoadData("key_and_data/highlighted_t_text.html", tTextContainer);

  let tip;

  // Tooltip functionality
  const spans = document.querySelectorAll(".highlight");
  spans.forEach((span) => {
    span.addEventListener("mouseover", (event) => {
      const el = event.target;
      const uids = el.dataset.uid.split(",");
      tip = document.createElement("div");
      tip.classList.add("tooltip");
      tip.textContent = el.dataset.uid
        .split(",")
        .map((uid) => `UID: ${uid}`)
        .join("\n");
      el.appendChild(tip);
      el.onpointermove = (e) => {
        if (e.target !== e.currentTarget) return;
        tip.style.left = `${e.clientX}px`;
        tip.style.top = `${e.clientY}px`;
      };
      document.querySelector("main").classList.add("fade");
      uids.forEach((uid) =>
        document
          .querySelectorAll(`.highlight[data-uid*="${uid}"]`)
          .forEach((span) => span.classList.add("mark"))
      );
    });
    span.addEventListener("mouseout", (event) => {
      tip.remove();
      tip = null;
      document.querySelector("main").classList.remove("fade");
      document
        .querySelectorAll(`.highlight.mark`)
        .forEach((span) => span.classList.remove("mark"));
    });
  });

  // Right click behavior (appear context menu)
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent the default context menu from showing

    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.display = "block";

    const clickedElement = event.target; // Define clickedElement here

    // Check if clicked quote is highlighted
    if (clickedElement.classList.contains("highlight-t")) {
      const tTextCitationText = clickedElement.textContent;
      const citationDetails = findAllCorrespondingLSCitations(
        tTextCitationText,
        keyData
      );

      // Clear the context menu before adding new content
      contextMenu.innerHTML = "";

      // Check if there are matching entries and append their details to the context menu
      if (citationDetails.length > 0) {
        citationDetails.forEach((detail) => {
          const { volume, textNo, quoteInLS } = detail;
          // Create a new div element for each citation detail
          const detailElement = document.createElement("div");
          detailElement.textContent = `Volume: ${volume}, Text No.: ${textNo}, Quote in LS: ${quoteInLS}`;
          // Append the detail element to the context menu
          contextMenu.appendChild(detailElement);
        });

        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.display = "block";
      }
    }
  });

  // Left click behavior (hide menu)
  document.addEventListener("click", function () {
    // Hide the custom context menu when clicking elsewhere
    contextMenu.style.display = "none";
  });


  // Click-Scroll functionality for LS Corpus
lsCorpusContainer.addEventListener("click", function (event) {
  const clickedElement = event.target;
  if (clickedElement.classList.contains("highlight")) {
    const uid = clickedElement.getAttribute("data-uid");
    if (uid) {
      console.log("Clicked something that's highlighted in ls pane...");
      console.log("uid = " + uid); // Check if UID is correctly extracted

      // Check if there's a matching T Text citation based on data-match-type
      const matchType = clickedElement.getAttribute("data-match-type");
      if (matchType === "1") {
        console.log("data-match-type = 1");
        // Find the corresponding T Text citation using data-uid attribute
        const tTextCitation = tTextContainer.querySelector(`[data-uid="${uid}"]`);
        // Scroll to the T Text citation if found
        if (tTextCitation) {
          tTextCitation.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          console.log("No corresponding T Text citation found for UID: " + uid);
        }
      } else if (matchType === "0") {
        console.log("data-match-type = 0");
        console.log("No corresponding T Text citation found for UID: " + uid);
      } else if (matchType === "2") {
        console.log("data-match-type = 2");
        // Do something
      } else {
        console.log("Invalid data-match-type value for UID: " + uid);
      }
    }
  }
});


  // // Click-Scroll functionality for T Text
  // tTextContainer.addEventListener("click", function (event) {
  //   const clickedElement = event.target;
  //   if (clickedElement.classList.contains("highlight-t")) {
  //     // Retrieve the text content of the clicked T Text citation
  //     const tTextCitationText = clickedElement.textContent;

  //     // Debug print highlighted text
  //     console.log("You clicked on t text line: " + tTextCitationText);

  //     // Log all corresponding LS citations for this T Text citation
  //     findAllCorrespondingLSCitations(tTextCitationText, keyData);
  //   }
  // });
});

// FUNCTION DEFINITIONS

function findAllCorrespondingLSCitations(tTextCitationText, keyData) {
  // Filter the keyData for all entries with the matching T Text citation
  const matchingEntries = keyData.filter(
    (row) => row["Quote in T Text"] === tTextCitationText
  );

  // Log the citation details to console
  console.log(`LS Citations for T Text citation "${tTextCitationText}":`);
  matchingEntries.forEach((entry) => {
    console.log(
      `Volume: ${entry["Volume"]}, Text No.: ${entry["Text No."]}, Quote in LS: ${entry["Quote in LS"]}`
    );
  });

  // Create an array to hold citation details (for printing to context menu)
  const citationDetails = matchingEntries.map((entry) => {
    return {
      volume: entry["Volume"],
      textNo: entry["Text No."],
      quoteInLS: entry["Quote in LS"],
    };
  });

  return citationDetails;
}

// Function to fetch and load text data into a container
function fetchAndLoadData(filePath, container) {
  return fetch(filePath)
    .then((response) => response.text())
    .then((textData) => {
      // Set the inner HTML of the container with the txt data
      container.innerHTML = textData.replace(/\n/g, "<br>"); // Converts newline characters to <br> for HTML display
    });
}

// Function to append LS Corpus info to each T Text citation
function appendLSCorpusInfo(tTextContainer, citationUidMap, keyData) {
  const tTextCitations = tTextContainer.querySelectorAll(".highlight-t");
  tTextCitations.forEach((tTextCitation) => {
    const citationText = tTextCitation.textContent;
    const uid = tTextCitation.getAttribute("data-uid");
    const matchingRow = keyData.find((row) => row["UID"] === uid);
    if (matchingRow) {
      const volume = matchingRow["Volume"];
      const textNo = matchingRow["Text No."];
      tTextCitation.textContent += ` (LS ${volume}.${textNo})`;
    }
  });
}

// // Simple CSV parser function
// function parseCSV(text) {
//   const lines = text.split(/\r?\n/);
//   const headers = lines.shift().split(",");
//   return lines.map((line) => {
//     const data = line.split(",");
//     return headers.reduce((obj, nextKey, index) => {
//       obj[nextKey] = data[index];
//       return obj;
//     }, {});
//   });
// }
