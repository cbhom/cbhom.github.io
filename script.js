let gameBoard = document.getElementById("gameBoard")
let isHighlighting = false;

//loop that creates the 6x6 board of the game
for (let i=0; i<6; i++) {
  const boxRow = document.createElement("div");
  boxRow.className = "boxRow";
  for (let j=0; j<6; j++) {
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute('data-row', i);
    box.setAttribute('data-col', j);
    
    //algorithm to color light and dark boxes
    if(i%2===0){
      if(j%2===0){
        box.style.backgroundColor = "black";
      }
      else {
        box.style.backgroundColor = "aqua";
      }
    }
    else{
      if(j%2===0){
        box.style.backgroundColor = "aqua";
      }
      else {
        box.style.backgroundColor = "black";
      }
    }
    
    if(i===0 && j===4) {
      box.style.background = "radial-gradient(lightBlue,black 20%)";
    }
    if(i===2 && j===1) {
      box.style.background = "radial-gradient(red,aqua 20%)";
    }
    if(i===2 && j===2) {
      box.style.background = "radial-gradient(orange,black 20%)";
    }
    if(i===4 && j===0) {
      box.style.background = "radial-gradient(lightGreen,black 20%)";
    }
    if(i===5 && j===4) {
      box.style.background = "radial-gradient(purple,aqua 20%)";
    }


    boxRow.append(box);

    //knight
    if (i===0 && j===3) {
      const knight = document.createElement("img")
      knight.src = "knight.svg";
      knight.alt = "Knight Piece";
      knight.className = "knight";
      knight.draggable = true;
      box.append(knight)
    }

  }
  gameBoard.append(boxRow);
}

function getKnightPosition() {
  const knight = document.querySelector('.knight');
  const box = knight.parentElement;
  return {
    row: parseInt(box.getAttribute('data-row')),
    col: parseInt(box.getAttribute('data-col'))
  };
}

function getLegalMoves(row, col) {
  const moves = [];
  const possibleMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (let [dr, dc] of possibleMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
      moves.push({ row: nr, col: nc });
    }
  }
  return moves;
}

function highlightLegalMoves() {
  const pos = getKnightPosition();
  const moves = getLegalMoves(pos.row, pos.col);
  moves.forEach(move => {
    const box = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
    box.classList.add('legal');
  });
}

function clearHighlights() {
  document.querySelectorAll('.legal').forEach(box => box.classList.remove('legal'));
}

//movements of the knight
const knight = document.querySelector(".knight");

// Variables for dragging
let isDragging = false;
let isMouseDragging = false;
let isTouchDragging = false;
let dragOffsetX, dragOffsetY;
let originalParent;

// Mouse events for desktop drag
knight.addEventListener("mousedown", mouseDown);
document.addEventListener("mousemove", mouseMove);
document.addEventListener("mouseup", mouseUp);

// Touch events for mobile drag
knight.addEventListener("touchstart", touchStart);
knight.addEventListener("touchmove", touchMove);
knight.addEventListener("touchend", touchEnd);

function startDrag(e) {
  beingDragged = e.target;
  isDragging = true;
  originalParent = beingDragged.parentElement;
  
  // Calculate offset from mouse/touch to knight center
  const rect = beingDragged.getBoundingClientRect();
  dragOffsetX = rect.width / 2;
  dragOffsetY = rect.height / 2;
  
  // Make knight follow cursor/finger
  beingDragged.style.position = 'fixed';
  beingDragged.style.zIndex = '1000';
  beingDragged.style.transform = 'scale(1.2)';
  beingDragged.style.pointerEvents = 'none';
  
  // Set initial position immediately to prevent jumping
  const initialX = e.clientX - dragOffsetX;
  const initialY = e.clientY - dragOffsetY;
  beingDragged.style.left = `${initialX}px`;
  beingDragged.style.top = `${initialY}px`;
  
  highlightLegalMoves();
}

function moveDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  
  const x = e.clientX - dragOffsetX;
  const y = e.clientY - dragOffsetY;
  
  beingDragged.style.left = `${x}px`;
  beingDragged.style.top = `${y}px`;
}

function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;
  isMouseDragging = false;
  isTouchDragging = false;
  
  // Reset knight styles
  beingDragged.style.position = '';
  beingDragged.style.zIndex = '';
  beingDragged.style.transform = '';
  beingDragged.style.left = '';
  beingDragged.style.top = '';
  beingDragged.style.pointerEvents = '';
  
  // Check if dropped on a legal box
  const targetElement = document.elementFromPoint(e.clientX, e.clientY);
  
  if (targetElement && targetElement.classList.contains('box')) {
    const pos = getKnightPosition();
    const moves = getLegalMoves(pos.row, pos.col);
    const targetRow = parseInt(targetElement.getAttribute('data-row'));
    const targetCol = parseInt(targetElement.getAttribute('data-col'));
    const isLegal = moves.some(move => move.row === targetRow && move.col === targetCol);
    if (isLegal) {
      targetElement.append(beingDragged);
    } else {
      // Return to original position if not legal
      originalParent.append(beingDragged);
    }
  } else {
    // Return to original position
    originalParent.append(beingDragged);
  }
  
  clearHighlights();
}

function mouseDown(e) {
  e.preventDefault();
  isMouseDragging = true;
  startDrag(e);
}

function mouseMove(e) {
  if (isMouseDragging) {
    moveDrag(e);
  }
}

function mouseUp(e) {
  if (isMouseDragging) {
    endDrag(e);
  }
}

function touchStart(e) {
  e.preventDefault();
  isTouchDragging = true;
  startDrag(e.touches[0]);
}

function touchMove(e) {
  if (isTouchDragging) {
    moveDrag(e.touches[0]);
  }
}

function touchEnd(e) {
  if (isTouchDragging) {
    endDrag(e.changedTouches[0]);
  }
}

let beingDragged;

// Click functionality
const knightElement = document.querySelector('.knight');
knightElement.addEventListener('click', () => {
  if (!isHighlighting) {
    highlightLegalMoves();
    isHighlighting = true;
  }
});



document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('click', (e) => {
    if (isHighlighting) {
      const pos = getKnightPosition();
      const moves = getLegalMoves(pos.row, pos.col);
      const targetRow = parseInt(box.getAttribute('data-row'));
      const targetCol = parseInt(box.getAttribute('data-col'));
      const isLegal = moves.some(move => move.row === targetRow && move.col === targetCol);
      if (isLegal) {
        box.append(document.querySelector('.knight'));
      }
      clearHighlights();
      isHighlighting = false;
    }
  });
});

