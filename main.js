import './style.css'

import * as THREE from 'three'
import ForceGraph3D from '3d-force-graph';

// Random tree
//const N = 400;
//const gData = {

//   nodes: [...Array(N).keys()].map(i => ({ id: i })),
//   links: [...Array(N).keys()]
//     .filter(id => id)
//     .map(id => ({
//       source: id,
//       target: Math.round(Math.random() * (id-1))
//     }))
// };
// const datum = {jsonUrl('nod.json')}

// // cross-link node objects
// links.forEach(link => {
//   const a = nodes[link.source];
//   const b = nodes[link.target];
//   !a.neighbors && (a.neighbors = []);
//   !b.neighbors && (b.neighbors = []);
//   a.neighbors.push(b);
//   b.neighbors.push(a);

//   !a.links && (a.links = []);
//   !b.links && (b.links = []);
//   a.links.push(link);
//   b.links.push(link);
// });

//above elemements not necessary when introducing json of data.

//let oldpos = null
const highlightNodes = new Set();
const highlightLinks = new Set();
const nodeinfo = new Set();
const clickednodes = new Set();
let hoverNode = null;
let selectedNodes = new Set();
let oldpos;

/*
function writevector3(_x,_y,_z){
  document.write("x,y,z");
}
writevector3(0,0,-1)
*/

//vector.applyQuaternion(THREE.Camera.quaternion);



const Graph = ForceGraph3D()
  (document.getElementById('3d-graph'))
    .jsonUrl('nod.json')
    .nodeLabel('id')
    .nodeRelSize(6)
    .nodeColor(node => selectedNodes.has(node) ? node === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : highlightNodes.has(node) ? 'yellow' : 'rgba(0,255,255,0.6)')
    .linkWidth(link => highlightLinks.has(link) ? 4 : 1)
    .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
    .linkDirectionalParticleWidth(4)
    .onNodeHover(node => {
      const untoggle = selectedNodes.has(node) && selectedNodes.size === 1;
      selectedNodes.clear();
      !untoggle && selectedNodes.add(node);
      Graph.nodeColor(Graph.nodeColor()); // update color of selected nodes - can change it to texture or visual effect too
    })
    .onNodeClick((node, event) => {
      if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;
      highlightNodes.clear();
      highlightLinks.clear();
      nodeinfo.clear();
      if (node) {
        highlightNodes.add(node);
        nodeinfo.add(node);
        node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
        node.links.forEach(link => highlightLinks.add(link));
      }
        //so what we r doing is if there is a point highlighted, dont update , so if the node we are on is a subset of highlightnodes, dont change oldpos, if we aren't on a node, update oldpos
        //so if a node is added to the selected nodes for the first time, store the old camera location. for subsequent times, do not store the camera location. submit this as oldpos to the window
        // when the background is clicked, if there is a value oldpos then go to oldpos and clear the cache of oldpos, else, do nothing.
      hoverNode = node || null;
      updateHighlight();
      const distance = 300;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      if (highlightNodes.keys===0) {
        console.log("imlogging!");
        //window.oldpos = Graph.cameraPosition();
      }
      else{
        const newPos = node.x || node.y || node.z
          ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
          : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

        Graph.cameraPosition(
          newPos, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        );
        }
      })
    .onBackgroundClick((event) =>{
      /*if (typeof oldpos === 'undefined'){
        console.log("denadada");
      }
      else {
        Graph.cameraPosition(
          [oldpos[0],oldpos[1],oldpos[2]],
          oldpos[4],
          3000)
            console.log(oldpos)
        //window.oldpos=null
      }*/
      nodeinfo.clear();
      Graph.zoomToFit(400);
      });
    Graph.onNodeDrag((node, translate) => {
      if (selectedNodes.has(node)) { // moving a selected node
        [...selectedNodes]
          .filter(selNode => selNode !== node) // don't touch node being dragged
          .forEach(node => ['x', 'y', 'z'].forEach(coord => node[`f${coord}`] = node[coord] + translate[coord])); // translate other nodes by same amount
      }
      })
    .onNodeDragEnd(node => {
      if (selectedNodes.has(node)) { // finished moving a selected node
        [...selectedNodes]
          .filter(selNode => selNode !== node) // don't touch node being dragged
          .forEach(node => ['x', 'y', 'z'].forEach(coord => node[`f${coord}`] = undefined)); // unfix controlled nodes
      }
    });
console.log(Graph.cameraPosition())

function updateHighlight() {
  // trigger update of highlighted objects in scene
  Graph
    .nodeColor(Graph.nodeColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles())
  }