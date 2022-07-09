  function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

export class NodeService {
  async getTreeNodes() {
	  //console.log("WAIT!");
	  //await sleep(5000);
	  return fetch('data/treenodes.json').then(res => res.json()).then(d => d.children);
      
  }

  // Iterate through json to recreate the full directory given a node
  getFullDirectory(node) {
    return fetch('data/treenodes.json').then(res => res.json()).then((data) => {
      let directory = "./downloads";
      let k = node.node.key;
	  k = k.split('-');
	  
      for (let i = 1; i < k.length; i += 1) {
        data = data.children;
        let idx = parseInt(k[i]);
        data = data[idx];
        directory += "/" + data.label;
      }
	  console.log(directory);
      return directory;
    });
  }
}