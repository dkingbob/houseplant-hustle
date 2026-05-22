// extract-assets.js — creates plant-only.glb from rhyzome_plant.glb
// Run: node scripts/extract-assets.js
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { KHRMaterialsSpecular } = require('@gltf-transform/extensions');
const { prune } = require('@gltf-transform/functions');

async function main() {
  const io = new NodeIO().registerExtensions([KHRMaterialsSpecular]);
  const ASSETS = path.join(__dirname, '..', 'assets');

  // ── plant-only.glb (remove pot node) ──
  const docPlant = await io.read(path.join(ASSETS, 'rhyzome_plant.glb'));
  docPlant.getRoot().listNodes().forEach(node => {
    const mesh = node.getMesh();
    if (mesh && mesh.getName().includes('concrete_pot')) {
      node.setMesh(null);
      console.log('Removed pot from node:', node.getName());
    }
  });
  await docPlant.transform(prune());
  await io.write(path.join(ASSETS, 'plant-only.glb'), docPlant);
  console.log('✅ plant-only.glb written');
}

main().catch(e => { console.error(e); process.exit(1); });
