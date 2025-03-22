const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "green";
// Add a rectangle at (10, 10) with size 100x100 pixels
//ctx.fillRect(10, 10, 100, 100);

const leftVanishingPoint = {x:0, y:canvas.height / 2}
const rightVanishingPoint = {x:canvas.width, y:canvas.height / 2}

const border = 30  


ctx.setLineDash([15,50])
ctx.strokeStyle = 'lightgrey'
ctx.beginPath()
ctx.moveTo(leftVanishingPoint.x, leftVanishingPoint.y)
ctx.lineTo(rightVanishingPoint.x, rightVanishingPoint.y);
ctx.stroke()


//
//              rp0 + lp0   ------      rp3
//              |                      /
//              |                     /
//              |                    /
//              lp1 + rp1 ----- rp2 /
//
//




for (let i = 0; i < 100; i++) {
    // find the first point, we draw 3 shapes
    let rightPoints = []
    let leftPoints = []
    let topOrBottomPoints = []

    // first shape (right side of box)

    // first point along x
    let leadingEdgeX = (Math.random() * (canvas.width - border)) + border

    // height between 10-40
    let height = (Math.random() * 30) + 10

    // initial y position
    let initialY = (Math.random() * (canvas.height - border)) + border

    rightPoints.push({x:leadingEdgeX, y:initialY})
    rightPoints.push({x:leadingEdgeX, y:initialY + height})
    rightPoints.push(findPointAlongLine(rightPoints[1], rightVanishingPoint, (Math.random() * 50) + 10))
    rightPoints.push(findIntersectionPoint(rightPoints[0], rightPoints[2].x, rightVanishingPoint))
    
    // find the line going towards the right vanishing point, then go length along that line

    
    
    drawBox(rightPoints)


    leftPoints.push(rightPoints[0])
    leftPoints.push(rightPoints[1])
    leftPoints.push(findPointAlongLine(leftPoints[1], leftVanishingPoint, (Math.random() - 50) + 10))
    leftPoints.push(findIntersectionPoint(leftPoints[0], leftPoints[2].x, leftVanishingPoint))

    drawBox(leftPoints)

    // now decide if we need a top or bottom
    if (rightPoints[0].y > rightVanishingPoint.y && rightPoints[1].y > rightVanishingPoint.y) {
        
        // we need a top
        topOrBottomPoints.push(leftPoints[3])
        topOrBottomPoints.push(rightPoints[0])
        topOrBottomPoints.push(rightPoints[3])
        topOrBottomPoints.push(intersect(leftPoints[3].x, leftPoints[3].y, rightVanishingPoint.x, rightVanishingPoint.y, rightPoints[3].x, rightPoints[3].y, leftVanishingPoint.x, leftVanishingPoint.y))
        drawBox(topOrBottomPoints)
    } else if (rightPoints[0].y < rightVanishingPoint.y && rightPoints[1].y < rightVanishingPoint.y) {
        // we need a bottom
        topOrBottomPoints.push(leftPoints[2])
        topOrBottomPoints.push(rightPoints[1])
        topOrBottomPoints.push(rightPoints[2])
        topOrBottomPoints.push(intersect(leftPoints[2].x, leftPoints[2].y, rightVanishingPoint.x, rightVanishingPoint.y, rightPoints[2].x, rightPoints[2].y, leftVanishingPoint.x, leftVanishingPoint.y))
        drawBox(topOrBottomPoints)
    }



    //let leadingEdgeLength = Math.random() * 100 - 50    
}

// from start x,y, to end x,y, find the point that is distance along that line
function findPointAlongLine(start, end, distance) {
    
    // Find Slope of the line
    var slope = (end.y-start.y)/(end.x-start.x);
    
    // Find angle of line
    var theta = Math.atan(slope);
    
    // the coordinates of the 
    var returnx= start.x + distance * Math.cos(theta);
    var returny= start.y + distance * Math.sin(theta);
    return {x:returnx, y:returny}
}

// findin
function findIntersectionPoint(start, x, end) {
    // give a buffer to make sure that there is an intersection
    const yLineStart = {x, y:-100}
    const yLineEnd = {x, y:canvas.height + 100}

    return intersect(start.x, start.y, end.x, end.y, yLineStart.x, yLineStart.y, yLineEnd.x, yLineEnd.y)
}

function drawBox(points) {
    ctx.strokeStyle = 'darkgreen'
    ctx.fillStyle = 'lightgreen'
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[1].x, points[1].y)
    ctx.lineTo(points[2].x, points[2].y)
    ctx.lineTo(points[3].x, points[3].y)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
}



// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false
      }
  
      let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          return false
      }
  
    // Return a object with the x and y coordinates of the intersection
      let x = x1 + ua * (x2 - x1)
      let y = y1 + ua * (y2 - y1)
  
      return {x, y}
  }
