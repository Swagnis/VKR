var core = core || {};

function destroy(network) {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function getChildNodes(current, nodes, edges, level = 0) {
    //pushh current node to tree node structure
    nodes.push({
        id: nodes.length,
        label: String(current.name),
        level: level
    });
    if (current.parent !== null) {
        let parent = nodes.find(x => x.label == current.parent);
        edges.push({ 
            from: nodes.length - 1,
            to: parent.id
        });
    }

    let children = core.graph.nodes.filter(x => x.parent === current.name);
    if (children.length > 0 ) {
        children.forEach((child) => {
            getChildNodes(child, nodes, edges, level + 1);
        });
    } else return;
}

function draw(network, containerId = "graph", onSelect = null) {
    if (network) {
        destroy(network);
    }
    nodes = [];
    edges = [];

    //push root keyword
    let graph = core.graph;
    let root = graph.nodes.find(x => x.parent === null);
    if (!root) return;
    getChildNodes(root, nodes, edges);

    // create a network
    var container = document.getElementById(containerId);
    var data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "vertical",
                roundness: 0.5
            }
        },
        layout: {
            hierarchical: {
                direction: "UD"
            }
        },
        physics: false
    };
    network = new vis.Network(container, data, options);
    console.log(typeof(network));
    if (onSelect) network.on("select", onSelect);
}