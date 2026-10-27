
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  PlaneGeometry,
  SphereGeometry,
} from "three";

const fruitCrops = new Set([
  "Mango", "Orange", "Apple", "Lemon", "Guava", "Coconut", "Grape",
  "Strawberry", "Papaya", "Banana", "Pineapple", "Watermelon",
]);

const leafyCrops = new Set([
  "Tomato", "Pepper", "Cucumber", "Cabbage", "Spinach", "Lettuce", "Okra",
]);

const rootCrops = new Set([
  "Carrot", "Potato", "Sweet Potato", "Cassava", "Yam", "Ginger",
  "Turmeric", "Onion",
]);

const legumeCrops = new Set(["Beans", "Groundnut", "Soybean", "Pea", "Cowpea"]);

const grainCrops = new Set([
  "Maize", "Rice", "Wheat", "Sorghum", "Millet", "Barley", "Oats",
]);

const cashCrops = new Set([
  "Sugarcane", "Cotton", "Cocoa", "Coffee", "Sesame", "Sunflower", "Tobacco",
]);

const bedCenters = [-1.65, 0, 1.65];

function getPlantLayout(plantCount) {
  const count = Math.max(1, Math.min(plantCount || 6, 12));
  const plantBedIndexes =
    count === 1
      ? [1]
      : count === 2
        ? [0, 2]
        : Array.from({ length: count }, (_, index) => index % bedCenters.length);
  const plantsPerBed = bedCenters.map(
    (_, bedIndex) =>
      plantBedIndexes.filter((assignedBed) => assignedBed === bedIndex).length
  );
  const plantsSeenPerBed = [0, 0, 0];
  const positions = plantBedIndexes.map((bedIndex) => {
    const rowIndex = plantsSeenPerBed[bedIndex];
    plantsSeenPerBed[bedIndex] += 1;
    return [
      bedCenters[bedIndex],
      0,
      rowIndex * 1.65 - ((plantsPerBed[bedIndex] - 1) * 1.65) / 2,
    ];
  });

  return { count, positions, plantBedIndexes, plantsPerBed };
}

const supportedCrops = new Set([
  ...fruitCrops,
  ...leafyCrops,
  ...rootCrops,
  ...legumeCrops,
  ...grainCrops,
  ...cashCrops,
]);

const fruitColors = {
  Mango: ["#EAA52E", "#E96B36", "#78A943"],
  Orange: ["#F28C28"],
  Apple: ["#C93432", "#D94B3D"],
  Lemon: ["#F4D447"],
  Guava: ["#A8C957", "#E7A0A0"],
  Papaya: ["#F3A34A"],
  Banana: ["#F5D34E"],
  Pineapple: ["#D9A53A"],
  Grape: ["#68439B", "#8A55B5"],
  Strawberry: ["#D93645"],
  Watermelon: ["#4F9148", "#D94C4C"],
  Coconut: ["#795438"],
};

function SkyDome() {
  const geometry = useMemo(() => {
    const skyGeometry = new SphereGeometry(1, 32, 16);
    const positions = skyGeometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const horizon = new Color("#D8D0B2");
    const midSky = new Color("#AAC6BD");
    const zenith = new Color("#78A8B3");
    const color = new Color();

    for (let index = 0; index < positions.count; index += 1) {
      const height = Math.max(0, Math.min(1, positions.getY(index) * 0.5 + 0.5));
      const skyBlend = Math.pow(height, 0.72);
      if (skyBlend < 0.55) {
        color.copy(horizon).lerp(midSky, skyBlend / 0.55);
      } else {
        color.copy(midSky).lerp(zenith, (skyBlend - 0.55) / 0.45);
      }
      color.toArray(colors, index * 3);
    }

    skyGeometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return skyGeometry;
  }, []);

  return (
    <mesh
      geometry={geometry}
      scale={48}
      frustumCulled={false}
      raycast={() => null}
    >
      <meshBasicMaterial
        vertexColors
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

function DistantScenery() {
  const hills = [
    [-12, -1.25, -20, 11, 2.3, 5.5, "#748B79"],
    [0, -1.5, -24, 13, 2.8, 6.5, "#899B82"],
    [14, -1.3, -21, 11, 2.2, 5.5, "#708776"],
  ];

  return (
    <group>
      {hills.map(([x, y, z, scaleX, scaleY, scaleZ, color], index) => (
        <mesh
          key={`distant-hill-${index}`}
          position={[x, y, z]}
          scale={[scaleX, scaleY, scaleZ]}
          frustumCulled={false}
          raycast={() => null}
        >
          <sphereGeometry args={[1, 32, 18]} />
          <meshStandardMaterial color={color} roughness={1} fog />
        </mesh>
      ))}
    </group>
  );
}

function FarmTerrain() {
  const geometry = useMemo(() => {
    const terrain = new PlaneGeometry(96, 96, 80, 80);
    const positions = terrain.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const grassColor = new Color("#64794D");
    const sunlitGrassColor = new Color("#829064");
    const color = new Color();

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const z = positions.getY(index);
      const distance = Math.max(Math.abs(x), Math.abs(z));
      const edge = Math.max(0, Math.min(1, (distance - 6) / 15));
      const blend = edge * edge * (3 - 2 * edge);
      const rollingHeight =
        Math.sin(x * 0.16 + z * 0.08) * 0.3 +
        Math.cos(z * 0.18 - x * 0.1) * 0.22 +
        Math.sin((x - z) * 0.33) * 0.05 +
        Math.exp(-((x + 16) ** 2) / 200 - ((z + 24) ** 2) / 100) * 1.1 +
        Math.exp(-((x - 3) ** 2) / 260 - ((z + 34) ** 2) / 160) * 1.3 +
        Math.exp(-((x - 20) ** 2) / 170 - ((z + 22) ** 2) / 120) * 0.95;

      positions.setZ(index, rollingHeight * blend);

      const grassVariation =
        (Math.sin(x * 0.21) * Math.cos(z * 0.17) + 1) * 0.5;
      color.copy(grassColor).lerp(sunlitGrassColor, grassVariation * 0.7);
      color.toArray(colors, index * 3);
    }

    terrain.setAttribute("color", new Float32BufferAttribute(colors, 3));
    terrain.rotateX(-Math.PI / 2);
    terrain.computeVertexNormals();
    return terrain;
  }, []);

  return (
    <mesh
      geometry={geometry}
      position={[0, -0.16, 0]}
      receiveShadow
      frustumCulled={false}
      raycast={() => null}
    >
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}

function OrchardFruit({ crop, position, color }) {
  const shape =
    crop === "Lemon"
      ? [0.72, 1.25, 0.72]
      : crop === "Guava"
        ? [1.05, 0.9, 1.05]
        : [1, 1, 1];

  return (
    <group position={position}>
      <Fruit position={[0, 0, 0]} color={color} scale={shape} />
      {crop === "Apple" && (
        <>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.08, 5]} />
            <meshStandardMaterial color="#68472E" />
          </mesh>
          <mesh position={[0.045, 0.055, 0]} rotation={[0, 0, -0.5]}>
            <sphereGeometry args={[0.035, 7, 5]} />
            <meshStandardMaterial color="#54823D" />
          </mesh>
        </>
      )}
      {crop === "Lemon" && [-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.072, 0, 0]}
          rotation={[0, 0, side * Math.PI / 2]}
        >
          <coneGeometry args={[0.035, 0.09, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {crop === "Orange" && (
        <mesh position={[0, 0.094, 0]}>
          <sphereGeometry args={[0.025, 6, 5]} />
          <meshStandardMaterial color="#8EA34A" />
        </mesh>
      )}
      {crop === "Guava" && (
        <mesh position={[0.025, -0.015, 0.075]} scale={[0.46, 0.5, 0.2]}>
          <sphereGeometry args={[0.09, 8, 6]} />
          <meshStandardMaterial color="#E7A0A0" />
        </mesh>
      )}
    </group>
  );
}

function Ground({
  soilType,
  isDry,
  isIrrigated,
  plantPositions,
  plantBedIndexes,
  selectedBedIndex,
  onSelectBed,
}) {
  const soilColors = {
    Sandy: "#C2A16B",
    Clay: "#8B5E3C",
    Loamy: "#654321",
    Silt: "#8A8060",
  };
  const soilColor = soilColors[soilType] || soilColors.Loamy;
  const bedTopColors = {
    Sandy: "#684625",
    Clay: "#593923",
    Loamy: "#4C321F",
    Silt: "#60452B",
  };
  const soilMottleColors = {
    Sandy: ["#A88759", "#9E8055", "#AD8E61"],
    Clay: ["#754C34", "#82583B", "#6D4933"],
    Loamy: ["#533A25", "#60442C", "#4B3523"],
    Silt: ["#786E53", "#857A5D", "#70674F"],
  };
  const bedXs = bedCenters;
  const stones = [
    [-4.1, -3.9, 0.14], [-3.8, 0.2, 0.11], [-4.3, 3.8, 0.12],
    [4.15, -2.8, 0.12], [4.35, 1.8, 0.16], [3.9, 4.2, 0.1],
    [-2.8, 4.5, 0.1], [2.7, -4.55, 0.13],
  ];
  const grassPatches = [
    [-4.1, -1.8], [-4.3, 2.1], [4.25, -0.8], [3.9, 3.1], [-2.7, -4.45],
  ];
  const groundGeometry = useMemo(() => {
    const geometry = new PlaneGeometry(12, 12, 32, 32);
    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const soil = new Color("#80694B");
    const grass = new Color("#718254");
    const color = new Color();

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const z = positions.getY(index);
      const distance = Math.max(Math.abs(x), Math.abs(z));
      const edge = Math.max(0, Math.min(1, (distance - 4.5) / 1.5));
      const blend = edge * edge * (3 - 2 * edge);
      const variation = (Math.sin(x * 3.1 + z * 1.7) + Math.cos(z * 2.4 - x)) * 0.035;

      color.copy(soil).lerp(grass, blend).multiplyScalar(1 + variation);
      color.toArray(colors, index * 3);
    }

    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group>
      <mesh
        geometry={groundGeometry}
        position={[0, -0.04, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          color={isDry ? "#B9A889" : "#FFFFFF"}
          roughness={1}
        />
      </mesh>

      {bedXs.map((x) => (
        <mesh
          key={`bed-${x}`}
          position={[x, 0.015, 0]}
          receiveShadow
        >
          <boxGeometry args={[1.4, 0.2, 7.75]} />
          <meshStandardMaterial
            color={isDry ? "#A98E5B" : soilColor}
            roughness={0.96}
          />
        </mesh>
      ))}

      {bedXs.map((x, bedIndex) => (
        <mesh
          key={`bed-top-${bedIndex}`}
          position={[x, 0.12, 0]}
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            onSelectBed(bedIndex);
          }}
        >
          <boxGeometry args={[1.28, 0.025, 7.62]} />
          <meshStandardMaterial
            color={
              isDry
                ? "#806444"
                : bedTopColors[soilType] || bedTopColors.Loamy
            }
            roughness={1}
          />
        </mesh>
      ))}

      {bedXs.map((x, bedIndex) => (
        <group key={`bed-edge-${x}`}>
          {[-0.69, 0.69].map((edgeX) => (
            <mesh
              key={`side-${edgeX}`}
              position={[x + edgeX, 0.145, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.045, 0.035, 7.7]} />
              <meshStandardMaterial
                color={edgeX < 0 ? "#765F42" : "#806849"}
                roughness={0.9}
              />
            </mesh>
          ))}
          {[-3.84, 3.84].map((edgeZ) => (
            <mesh
              key={`end-${edgeZ}`}
              position={[x, 0.145, edgeZ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[1.38, 0.035, 0.045]} />
              <meshStandardMaterial
                color={edgeZ < 0 ? "#765F42" : "#806849"}
                roughness={0.9}
              />
            </mesh>
          ))}
          {selectedBedIndex === bedIndex && (
            <group position={[x, 0.166, 0]}>
              <mesh position={[-0.66, 0, 0]}>
                <boxGeometry args={[0.022, 0.014, 7.58]} />
                <meshBasicMaterial color="#FFE36E" />
              </mesh>
              <mesh position={[0.66, 0, 0]}>
                <boxGeometry args={[0.022, 0.014, 7.58]} />
                <meshBasicMaterial color="#FFE36E" />
              </mesh>
              {[-3.79, 3.79].map((z) => (
                <mesh key={`selected-end-${z}`} position={[0, 0, z]}>
                  <boxGeometry args={[1.32, 0.014, 0.022]} />
                  <meshBasicMaterial color="#FFE36E" />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}

      {[-2.43, -0.82, 0.82, 2.43].map((x) => (
        <mesh key={`furrow-${x}`} position={[x, 0.008, 0]}>
          <boxGeometry args={[0.16, 0.025, 7.75]} />
          <meshStandardMaterial color="#493622" roughness={1} />
        </mesh>
      ))}

      <mesh position={[0, 0.005, 4.62]}>
        <boxGeometry args={[8.4, 0.035, 0.9]} />
        <meshStandardMaterial color="#A18A67" roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`side-path-${side}`} position={[side * 3.48, 0.004, 0]}>
          <boxGeometry args={[0.78, 0.03, 8.4]} />
          <meshStandardMaterial color="#A18A67" roughness={1} />
        </mesh>
      ))}

      {isIrrigated && plantPositions.map(([x, , z], index) => (
        <mesh
          key={`moist-soil-${index}`}
          position={[x, 0.143, z]}
          rotation={[-Math.PI / 2, 0, (index % 3) * 0.42]}
          scale={[1.3 + (index % 2) * 0.18, 0.78 + (index % 3) * 0.1, 1]}
          onClick={(event) => {
            event.stopPropagation();
            onSelectBed(plantBedIndexes[index]);
          }}
        >
          <circleGeometry args={[0.31, 14]} />
          <meshStandardMaterial
            color="#464532"
            roughness={1}
            transparent
            opacity={0.78}
            depthWrite={false}
          />
        </mesh>
      ))}

      {!isIrrigated && isDry && bedXs.flatMap((x) => [-2.7, -1.1, 0.7, 2.4].map((z, index) => (
        <group key={`crack-${x}-${z}`} position={[x + (index % 2) * 0.18, 0.137, z]}>
          <mesh rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.42, 0.008, 0.03]} />
            <meshStandardMaterial color="#3F2B1D" roughness={1} />
          </mesh>
          <mesh position={[0.11, 0, 0.08]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.24, 0.008, 0.025]} />
            <meshStandardMaterial color="#3F2B1D" roughness={1} />
          </mesh>
        </group>
      )))}

      {bedXs.flatMap((x, bedIndex) =>
        [-2.8, -0.75, 1.85, 3.05].map((z, patchIndex) => (
          <mesh
            key={`soil-mottle-${bedIndex}-${patchIndex}`}
            position={[
              x + (patchIndex % 2 ? 0.34 : -0.3),
              0.139,
              z + (bedIndex % 2 ? 0.22 : -0.16),
            ]}
            rotation={[0, (bedIndex + patchIndex) * 0.47, 0]}
            scale={[
              0.035 + (patchIndex % 3) * 0.012,
              0.012,
              0.045 + (patchIndex % 2) * 0.014,
            ]}
          >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={
                isDry
                  ? "#A18A62"
                  : soilMottleColors[soilType]?.[(bedIndex + patchIndex) % 3] ||
                    soilMottleColors.Loamy[(bedIndex + patchIndex) % 3]
              }
              roughness={1}
            />
          </mesh>
        ))
      )}

      {grassPatches.map(([x, z], index) => (
        <group key={`grass-${index}`} position={[x, 0.02, z]}>
          {[-1, 0, 1].map((blade) => (
            <mesh
              key={blade}
              position={[blade * 0.055, 0.08 + (Math.abs(blade) % 2) * 0.025, 0]}
              rotation={[0, blade * 0.6, blade * -0.22]}
            >
              <coneGeometry args={[0.035, 0.2, 5]} />
              <meshStandardMaterial color={index % 2 ? "#668246" : "#748B4C"} />
            </mesh>
          ))}
        </group>
      ))}

      {stones.map(([x, z, size], index) => (
        <mesh
          key={`stone-${index}`}
          position={[x, size * 0.28, z]}
          rotation={[0.2, index * 0.7, 0.1]}
          scale={[1.35, 0.65, 0.9]}
          castShadow
        >
          <dodecahedronGeometry args={[size, 0]} />
          <meshStandardMaterial color={index % 2 ? "#827B68" : "#9B8D74"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Leaf({
  position,
  rotation = [0, 0, 0],
  scale = [1, 0.32, 0.48],
  color = "#4F963D",
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
    >
      <sphereGeometry args={[0.22, 10, 7]} />
      <meshStandardMaterial color={color} roughness={0.86} />
    </mesh>
  );
}

function Fruit({ position, color, scale = [1, 1, 1] }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[0.105, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.48} />
    </mesh>
  );
}

const maizeLeafGeometry = (() => {
  const geometry = new BufferGeometry();
  const lengthSegments = 12;
  const widthSegments = 4;
  const positions = [];
  const indices = [];

  for (let lengthIndex = 0; lengthIndex <= lengthSegments; lengthIndex += 1) {
    const along = lengthIndex / lengthSegments;
    const width = 0.12 * Math.pow(Math.sin(Math.PI * along), 0.72);
    const centerZ = 0.04 * Math.sin(Math.PI * along) - 0.15 * along * along;

    for (let widthIndex = 0; widthIndex <= widthSegments; widthIndex += 1) {
      const across = (widthIndex / widthSegments) * 2 - 1;
      positions.push(
        along,
        across * width,
        centerZ +
          0.045 * (1 - across * across) * Math.sin(Math.PI * along)
      );
    }
  }

  for (let lengthIndex = 0; lengthIndex < lengthSegments; lengthIndex += 1) {
    for (let widthIndex = 0; widthIndex < widthSegments; widthIndex += 1) {
      const start = lengthIndex * (widthSegments + 1) + widthIndex;
      const nextRow = start + widthSegments + 1;
      indices.push(start, nextRow, start + 1, start + 1, nextRow, nextRow + 1);
    }
  }

  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
})();

function MaizeLeaf({ position, rotation, length, color }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[length, 1, 1]}
      castShadow
    >
      <primitive object={maizeLeafGeometry} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.9} side={2} />
    </mesh>
  );
}

function BladeLeaf({ position, rotation = [0, 0, 0], length = 0.7, color = "#4F963D" }) {
  return (
    <MaizeLeaf
      position={position}
      rotation={rotation}
      length={length}
      color={color}
    />
  );
}

function CornEar({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={[0.098, 0.32, 0.098]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#DDAF3D" roughness={0.72} />
      </mesh>

      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 4 }, (_, kernel) => {
          const angle =
            ((kernel + (row % 2) * 0.5) / 4) * Math.PI * 2;
          const y = (row - 2) * 0.105;

          return (
            <mesh
              key={`${row}-${kernel}`}
              position={[
                Math.cos(angle) * 0.086,
                y,
                Math.sin(angle) * 0.086,
              ]}
              scale={[0.022, 0.034, 0.022]}
            >
              <sphereGeometry args={[1, 7, 6]} />
              <meshStandardMaterial
                color={(row + kernel) % 3 === 0 ? "#F0C64D" : "#E7B83C"}
                roughness={0.64}
              />
            </mesh>
          );
        })
      )}

      <MaizeLeaf
        position={[-0.055, -0.2, 0.01]}
        rotation={[0.05, 0.05, 1.2]}
        length={0.42}
        color="#668345"
      />
      <MaizeLeaf
        position={[0.045, -0.18, -0.025]}
        rotation={[-0.06, Math.PI + 0.12, 1.76]}
        length={0.4}
        color="#78924A"
      />
      <MaizeLeaf
        position={[-0.04, -0.08, 0.03]}
        rotation={[0.14, -0.12, -0.62]}
        length={0.34}
        color="#4B873B"
      />
      <MaizeLeaf
        position={[0.035, -0.1, -0.035]}
        rotation={[-0.12, Math.PI + 0.1, 0.62]}
        length={0.33}
        color="#5A9845"
      />
    </group>
  );
}

function MangoTree({ leafColor, isWaterStressed }) {
  const leaves = [
    [-0.68, 1.55, 0.02, -0.7],
    [-0.48, 1.88, 0.12, 0.35],
    [-0.2, 2.08, -0.15, -0.25],
    [0.12, 2.12, 0.12, 0.5],
    [0.48, 1.9, -0.08, -0.55],
    [0.68, 1.58, 0.05, 0.4],
    [-0.42, 1.48, -0.3, 0.65],
    [-0.1, 1.72, 0.35, -0.55],
    [0.3, 1.55, 0.32, 0.6],
    [0.1, 2.35, 0, -0.1],
    [-0.65, 1.9, -0.18, 0.6],
    [0.62, 2.02, 0.2, -0.4],
    [-0.28, 2.25, 0.24, 0.8],
    [0.36, 2.24, -0.24, -0.8],
    [-0.72, 1.72, 0.28, 0.3],
    [0.72, 1.78, -0.25, -0.2],
    [0, 1.48, -0.38, 0.15],
    [0.02, 1.95, 0.42, -0.4],
  ];

  const branches = [
    [-0.22, 1.0, 0, 0.48],
    [0.22, 1.2, 0, -0.5],
    [-0.28, 1.42, 0, 0.68],
    [0.25, 1.48, 0, -0.68],
  ];

  const fruits = [
    [-0.48, 1.42, 0.13],
    [0.44, 1.48, 0.08],
    [0.12, 1.72, 0.32],
    [-0.18, 1.85, -0.24],
    [0.58, 1.75, -0.12],
  ];

  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.17, 1.45, 10]} />
        <meshStandardMaterial color="#765033" roughness={1} />
      </mesh>

      {branches.map(([x, y, z, angle], i) => (
        <mesh
          key={i}
          position={[x * 0.65, y, z]}
          rotation={[0, 0, angle]}
          castShadow
        >
          <cylinderGeometry args={[0.025, 0.06, 0.72, 7]} />
          <meshStandardMaterial color="#765033" roughness={1} />
        </mesh>
      ))}

      {leaves.map(([x, y, z, angle], i) => (
        <Leaf
          key={i}
          position={[x, y, z]}
          rotation={[0.12, angle * 0.4, angle]}
          scale={
            isWaterStressed
              ? [0.9, 0.28, 0.4]
              : [1.3, 0.3, 0.42]
          }
          color={leafColor}
        />
      ))}

      {!isWaterStressed &&
        fruits.map(([x, y, z], i) => (
          <Fruit
            key={i}
            position={[x, y, z]}
            color={["#EAA52E", "#E96B36", "#78A943"][i % 3]}
            scale={[0.8, 1.25, 0.8]}
          />
        ))}
    </group>
  );
}

function FruitPlant({ crop, leafColor, stressed }) {
  const canopyPositions = [
    [-0.34, 1.38, 0],
    [0.3, 1.42, 0.1],
    [0, 1.68, 0],
    [-0.08, 1.52, 0.28],
    [0.14, 1.53, -0.25],
    [-0.28, 1.72, -0.2],
    [0.3, 1.7, -0.15],
  ];

  const colors = fruitColors[crop] || ["#E9A23B"];

  if (crop === "Mango") {
    return (
      <MangoTree
        leafColor={leafColor}
        isWaterStressed={stressed}
      />
    );
  }

  if (crop === "Coconut") {
    return (
      <group>
        <mesh position={[0, 1, 0]} rotation={[0, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.11, 0.16, 2, 9]} />
          <meshStandardMaterial color="#806044" roughness={1} />
        </mesh>

        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;

          return (
            <Leaf
              key={i}
              position={[
                Math.cos(a) * 0.55,
                1.95 + Math.sin(i * 1.7) * 0.12,
                Math.sin(a) * 0.55,
              ]}
              rotation={[Math.cos(a) * 0.55, a, Math.sin(a) * 0.75]}
              scale={[2.2, 0.22, 0.38]}
              color={leafColor}
            />
          );
        })}

        {!stressed &&
          [0, 1, 2].map((i) => (
            <Fruit
              key={i}
              position={[
                Math.cos(i * 2.1) * 0.2,
                1.72 - (i % 2) * 0.12,
                Math.sin(i * 2.1) * 0.2,
              ]}
              color="#795438"
              scale={[1.15, 1.2, 1.15]}
            />
          ))}
      </group>
    );
  }

  if (crop === "Banana") {
    return (
      <group>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 1.6, 9]} />
          <meshStandardMaterial color="#78914A" />
        </mesh>

        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;

          return (
            <Leaf
              key={i}
              position={[
                Math.cos(a) * 0.42,
                1.48 + Math.sin(i * 1.3) * 0.15,
                Math.sin(a) * 0.42,
              ]}
              rotation={[0.2, a, Math.cos(a) * 0.3]}
              scale={[2.25, 0.22, 0.55]}
              color={leafColor}
            />
          );
        })}

        {!stressed &&
          Array.from({ length: 7 }, (_, i) => (
            <Fruit
              key={i}
              position={[0.22 + (i % 2) * 0.12, 1 - i * 0.09, 0.15]}
              color="#F3D34A"
              scale={[0.65, 1.5, 0.65]}
            />
          ))}
      </group>
    );
  }

  if (crop === "Pineapple") {
    return (
      <group>
        <mesh position={[0, 0.43, 0]} scale={[0.68, 1.05, 0.68]}>
          <sphereGeometry args={[0.42, 12, 10]} />
          <meshStandardMaterial color="#D6A43B" />
        </mesh>

        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;

          return (
            <Leaf
              key={i}
              position={[
                Math.cos(a) * 0.24,
                0.86 + (i % 3) * 0.04,
                Math.sin(a) * 0.24,
              ]}
              rotation={[0.2, a, Math.cos(a) * 0.65]}
              scale={[1.45, 0.22, 0.4]}
              color={leafColor}
            />
          );
        })}

        {Array.from({ length: 5 }, (_, i) => (
          <Leaf
            key={`top-${i}`}
            position={[
              Math.cos(i * 1.25) * 0.12,
              1.15 + (i % 2) * 0.08,
              Math.sin(i * 1.25) * 0.12,
            ]}
            rotation={[0, i * 1.25, 0.25]}
            scale={[1.3, 0.18, 0.32]}
            color={leafColor}
          />
        ))}
      </group>
    );
  }

  if (crop === "Grape") {
    return (
      <group>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 1.8, 7]} />
          <meshStandardMaterial color="#795438" />
        </mesh>

        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[1.25, 0.06, 0.12]} />
          <meshStandardMaterial color="#795438" />
        </mesh>

        {Array.from({ length: 9 }, (_, i) => (
          <Leaf
            key={`leaf-${i}`}
            position={[
              (i - 4) * 0.14,
              1.75 + Math.sin(i) * 0.1,
              Math.sin(i * 2) * 0.16,
            ]}
            rotation={[0.2, i, (i % 2 ? -1 : 1) * 0.3]}
            scale={[1.05, 0.3, 0.72]}
            color={leafColor}
          />
        ))}

        {!stressed &&
          [0, 1, 2].map((b) =>
            Array.from({ length: 4 }, (_, i) => (
              <Fruit
                key={`${b}-${i}`}
                position={[(b - 1) * 0.38, 1.48 - i * 0.13, 0.18]}
                color="#70439A"
                scale={[0.72, 0.78, 0.72]}
              />
            ))
          )}
      </group>
    );
  }

  if (crop === "Watermelon") {
    return (
      <group>
        {Array.from({ length: 7 }, (_, i) => (
          <Leaf
            key={`vine-${i}`}
            position={[
              Math.cos(i * 0.9) * 0.28,
              0.2 + (i % 2) * 0.06,
              Math.sin(i * 0.9) * 0.25,
            ]}
            rotation={[0.1, i, i % 2 ? -0.3 : 0.3]}
            scale={[1.3, 0.23, 0.8]}
            color={leafColor}
          />
        ))}
        {!stressed && [[-0.14, 0.19, 0], [0.18, 0.2, 0.04]].map((p, i) => (
          <group key={`melon-${i}`} position={p}>
            <Fruit position={[0, 0, 0]} color="#4F9148" scale={[1.8, 1.1, 1.25]} />
            {[-0.08, 0, 0.08].map((stripe) => (
              <mesh key={stripe} position={[stripe, 0, 0.105]} scale={[0.035, 0.82, 0.1]}>
                <sphereGeometry args={[0.1, 6, 5]} />
                <meshStandardMaterial color="#A7B94E" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  if (crop === "Strawberry") {
    return (
      <group>
        {Array.from({ length: 7 }, (_, i) => (
          <Leaf
            key={i}
            position={[
              Math.cos(i * 0.9) * 0.25,
              0.22 + (i % 2) * 0.08,
              Math.sin(i * 0.9) * 0.22,
            ]}
            rotation={[0.1, i, i % 2 ? -0.3 : 0.3]}
            scale={[1.25, 0.25, 0.85]}
            color={leafColor}
          />
        ))}

        {!stressed && [[-0.2, 0.13, 0.08], [0.18, 0.14, -0.08], [0.05, 0.12, 0.2]].map((p, i) => (
          <group key={i} position={p}>
            <mesh rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.095, 0.19, 8]} />
              <meshStandardMaterial color="#D93645" roughness={0.48} />
            </mesh>
            {Array.from({ length: 4 }, (_, seed) => (
              <mesh
                key={seed}
                position={[Math.cos(seed * Math.PI / 2) * 0.045, (seed % 2) * 0.035 - 0.02, 0.07]}
                scale={[0.012, 0.02, 0.012]}
              >
                <sphereGeometry args={[1, 5, 4]} />
                <meshStandardMaterial color="#F4D47A" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  if (crop === "Papaya") {
    return (
      <group>
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 2.1, 9]} />
          <meshStandardMaterial color="#765033" roughness={1} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          return (
            <group key={i} position={[0, 1.95, 0]} rotation={[0.25, angle, 0.18]}>
              <BladeLeaf
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                length={1.15}
                color={leafColor}
              />
            </group>
          );
        })}
        {!stressed && [0, 1, 2, 3].map((i) => (
          <Fruit
            key={i}
            position={[0.13 * Math.cos(i * 1.5), 1.18 + i * 0.2, 0.14 * Math.sin(i * 1.5)]}
            color={colors[i % colors.length]}
            scale={[0.72, 1.55, 0.72]}
          />
        ))}
      </group>
    );
  }

  // Citrus, apple and guava trees share a rounded orchard canopy.
  return (
    <group>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.15, 1.4, 9]} />
        <meshStandardMaterial color="#795438" />
      </mesh>

      {[
        [-0.2, 1.08, 0, -0.55],
        [0.2, 1.2, 0.02, 0.55],
        [-0.16, 1.36, 0, -0.45],
        [0.16, 1.42, 0, 0.48],
      ].map(([x, y, z, angle], i) => (
        <mesh key={`branch-${i}`} position={[x, y, z]} rotation={[0, 0, angle]} castShadow>
          <cylinderGeometry args={[0.018, 0.04, 0.58, 6]} />
          <meshStandardMaterial color="#795438" />
        </mesh>
      ))}

      {[
        [0, 1.55, 0],
        [-0.32, 1.38, 0.04],
        [0.3, 1.4, 0.1],
        [0, 1.78, 0.1],
        [-0.1, 1.55, -0.27],
        [0.22, 1.62, -0.22],
      ].map((p, i) => (
        <group key={i} position={p}>
          <Leaf
            position={[0, 0, 0]}
            rotation={[0.18, i * 1.2, i % 2 ? -0.35 : 0.35]}
            scale={
              crop === "Lemon"
                ? [1.1, 0.22, 0.55]
                : crop === "Guava"
                  ? [1.25, 0.28, 0.95]
                  : crop === "Apple"
                    ? [1.35, 0.34, 0.92]
                    : [1.5, 0.3, 0.86]
            }
            color={crop === "Apple" && i % 2 === 0 ? "#477D39" : leafColor}
          />
          <BladeLeaf
            position={[0, 0.01, 0]}
            rotation={[0.1, i * 1.2, i % 2 ? -0.35 : 0.35]}
            length={0.72}
            color={leafColor}
          />
        </group>
      ))}

      {!stressed &&
        canopyPositions
          .slice(0, crop === "Orange" ? 6 : 5)
          .map((p, i) => (
            <OrchardFruit
              key={i}
              crop={crop}
              position={[p[0] * 0.85, 1.38 + (i % 2) * 0.2, p[2] + 0.1]}
              color={colors[i % colors.length]}
            />
          ))}
    </group>
  );
}

function VegetablePlant({ crop, leafColor, stemColor, stressed }) {
  const leafCount = crop === "Cabbage" || crop === "Lettuce" ? 12 : 8;
  const isHead = crop === "Cabbage" || crop === "Lettuce";
  const lowCreeper = crop === "Cucumber";
  const stemHeight = crop === "Pepper" ? 0.78 : crop === "Okra" ? 0.72 : lowCreeper ? 0.24 : 0.58;

  return (
    <group>
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.075, stemHeight, 7]} />
        <meshStandardMaterial color={stemColor} />
      </mesh>

      {Array.from({ length: leafCount }, (_, i) => {
        const a = (i / leafCount) * Math.PI * 2;
        const broad = ["Cabbage", "Lettuce", "Spinach"].includes(crop);
        const radius = isHead ? 0.2 + (i % 3) * 0.035 : crop === "Cucumber" ? 0.33 : 0.22;
        const height = isHead ? 0.3 + (i % 4) * 0.055 : 0.3 + (i % 3) * 0.11;

        return (
          <group key={i} position={[Math.cos(a) * radius, height, Math.sin(a) * radius]}>
            <Leaf
              rotation={[0.18, a, isHead ? -0.35 : Math.cos(a) * 0.4]}
              scale={isHead ? [1.45, 0.22, 1.05] : broad ? [1.1, 0.2, 0.65] : [1.05, 0.22, 0.42]}
              color={i % 3 === 0 ? "#68A94B" : leafColor}
            />
            {crop === "Spinach" && (
              <BladeLeaf rotation={[0.15, a, Math.cos(a) * 0.25]} length={0.7} color={leafColor} />
            )}
          </group>
        );
      })}

      {crop === "Cabbage" && (
        <group position={[0, 0.47, 0]}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh
              key={i}
              position={[Math.cos(i * 1.25) * 0.075, (i % 2) * 0.035, Math.sin(i * 1.25) * 0.075]}
              scale={[0.9, 0.72, 0.9]}
            >
              <sphereGeometry args={[0.19, 10, 8]} />
              <meshStandardMaterial color={i % 2 ? "#8DBB58" : "#A6C96A"} roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {crop === "Lettuce" && Array.from({ length: 5 }, (_, i) => (
        <BladeLeaf
          key={`inner-${i}`}
          position={[0, 0.4 + i * 0.025, 0]}
          rotation={[0.2, i * 1.25, -0.2]}
          length={0.44 + (i % 2) * 0.08}
          color={i % 2 ? "#8DBD56" : leafColor}
        />
      ))}

      {crop === "Tomato" && [0, 1, 2].map((i) => (
        <mesh key={`tomato-stem-${i}`} position={[(i - 1) * 0.13, 0.48 + (i % 2) * 0.1, 0.02]} rotation={[0, 0, (i - 1) * 0.48]}>
          <cylinderGeometry args={[0.012, 0.018, 0.48, 5]} />
          <meshStandardMaterial color={stemColor} />
        </mesh>
      ))}

      {crop === "Pepper" && [-1, 1].map((side) => (
        <mesh
          key={`pepper-branch-${side}`}
          position={[side * 0.12, 0.55, 0]}
          rotation={[0, 0, side * -0.52]}
        >
          <cylinderGeometry args={[0.014, 0.022, 0.38, 5]} />
          <meshStandardMaterial color={stemColor} />
        </mesh>
      ))}

      {crop === "Cucumber" && [0, 1, 2].map((i) => (
        <mesh
          key={`cucumber-runner-${i}`}
          position={[(i - 1) * 0.19, 0.12, (i % 2 ? 0.15 : -0.15)]}
          rotation={[0, 0, (i - 1) * 0.12]}
        >
          <cylinderGeometry args={[0.012, 0.018, 0.34, 5]} />
          <meshStandardMaterial color="#4B873B" />
        </mesh>
      ))}

      {!stressed &&
        crop === "Tomato" &&
        [[-0.13, 0.52, 0.08], [0.16, 0.45, -0.08], [0.04, 0.62, 0.12]].map((p, i) => (
          <Fruit
            key={i}
            position={p}
            color="#D83C32"
            scale={[1.05, 1.05, 1.05]}
          />
        ))}

      {!stressed && crop === "Cucumber" && (
        <Fruit position={[0.22, 0.24, 0.08]} color="#3C8A43" scale={[0.55, 1.9, 0.55]} />
      )}

      {!stressed && crop === "Okra" && (
        <Fruit position={[0.12, 0.52, 0.06]} color="#4D8A43" scale={[0.45, 1.8, 0.45]} />
      )}
      {!stressed && crop === "Pepper" && [0, 1, 2].map((i) => (
        <group key={`pepper-${i}`} position={[(i - 1) * 0.16, 0.42 + (i % 2) * 0.12, 0.1]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.08, 0.24, 7]} />
            <meshStandardMaterial color={i === 1 ? "#D83C32" : "#4D9B42"} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.08, 5]} />
            <meshStandardMaterial color="#3F7935" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RootPlant({ crop, leafColor }) {
  const leafCount = crop === "Cassava" ? 7 : crop === "Carrot" ? 8 : crop === "Onion" ? 6 : 5;

  return (
    <group>
      {crop === "Carrot" && (
        <>
          <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.13, 0.46, 8]} />
            <meshStandardMaterial color="#E98B2A" />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.07, 0.12, 0]} rotation={[0, 0, side * 0.32]}>
              <coneGeometry args={[0.09, 0.34, 7]} />
              <meshStandardMaterial color="#E98B2A" />
            </mesh>
          ))}
        </>
      )}

      {crop === "Onion" && (
        <>
          <mesh position={[0, 0.14, 0]} scale={[0.9, 0.78, 0.9]}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial color="#D4B36A" />
          </mesh>
          <mesh position={[0, 0.31, 0]} scale={[0.52, 0.18, 0.52]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#E3D2A3" />
          </mesh>
        </>
      )}

      {(crop === "Potato" || crop === "Sweet Potato" || crop === "Yam") && (
        <>
          {[-1, 0, 1].map((i) => (
            <mesh
              key={i}
              position={[i * 0.18, 0.09 + (Math.abs(i) * 0.015), 0.03 * (i % 2)]}
              rotation={[0.2, i * 0.4, 0.35 + i * 0.12]}
              scale={crop === "Yam" ? [0.52, 1.2, 0.58] : [0.72, 0.62, 0.58]}
            >
              <sphereGeometry args={[0.2, 9, 7]} />
              <meshStandardMaterial color={crop === "Potato" ? "#B99462" : crop === "Yam" ? "#A17B51" : "#C77E4A"} />
            </mesh>
          ))}
        </>
      )}

      {crop === "Potato" && [-1, 0, 1].map((i) => (
        <group
          key={`potato-eyes-${i}`}
          position={[i * 0.18, 0.09 + Math.abs(i) * 0.015, 0.03 * (i % 2)]}
        >
          {[[-0.06, 0.08, 0.07], [0.055, -0.035, 0.12], [0.02, 0.11, -0.1]].map((point, eye) => (
            <mesh key={eye} position={point} scale={[0.035, 0.025, 0.02]}>
              <sphereGeometry args={[1, 5, 4]} />
              <meshStandardMaterial color="#765633" />
            </mesh>
          ))}
        </group>
      ))}

      {crop === "Sweet Potato" && (
        <group>
          {[-1, 1].map((side) => (
            <Leaf
              key={side}
              position={[side * 0.36, 0.13, 0.08]}
              rotation={[0.1, side * 0.4, side * -0.2]}
              scale={[1.4, 0.2, 0.75]}
              color={leafColor}
            />
          ))}
        </group>
      )}

      {crop === "Cassava" && [-1, 0, 1].map((i) => (
        <mesh
          key={`cassava-root-${i}`}
          position={[i * 0.15, 0.04, 0.08]}
          rotation={[0, 0, i * 0.16]}
          scale={[0.22, 0.72, 0.24]}
        >
          <coneGeometry args={[0.2, 0.48, 7]} />
          <meshStandardMaterial color="#D7C49A" roughness={0.95} />
        </mesh>
      ))}

      {(crop === "Ginger" || crop === "Turmeric") && (
        <>
          {[-1, 0, 1].map((i) => (
            <mesh key={i} position={[i * 0.12, 0.12 + (i === 0 ? 0.04 : 0), 0]} scale={[0.68, 0.42, 0.62]}>
              <sphereGeometry args={[0.2, 9, 7]} />
              <meshStandardMaterial color={crop === "Ginger" ? "#B9955B" : "#D99A24"} />
            </mesh>
          ))}
        </>
      )}

      {crop === "Turmeric" && (
        <mesh position={[0, 0.82, 0]}>
          <coneGeometry args={[0.1, 0.22, 6]} />
          <meshStandardMaterial color="#E3C764" />
        </mesh>
      )}

      {Array.from({ length: leafCount }, (_, i) => {
        const a = (i / leafCount) * Math.PI * 2;

        if (crop === "Cassava") {
          return (
            <group
              key={i}
              position={[0, 0.65, 0]}
              rotation={[0.2, a, Math.cos(a) * 0.25]}
            >
              <BladeLeaf position={[0, 0.24, 0]} length={0.76} color={leafColor} />
              {[-1, 1].map((side) => (
                <BladeLeaf key={side} position={[side * 0.12, 0.14, 0]} rotation={[0, 0, side * 0.45]} length={0.44} color="#4F963D" />
              ))}
            </group>
          );
        }

        if (crop === "Carrot") {
          return (
            <group key={i} position={[0, 0.38, 0]} rotation={[0.18, a, 0]}>
              {[0, 1, 2].map((j) => (
                <BladeLeaf key={j} position={[0, j * 0.035, 0]} rotation={[0, j * 0.22, -0.26]} length={0.78 - j * 0.12} color={leafColor} />
              ))}
            </group>
          );
        }

        if (crop === "Onion") {
          return (
            <BladeLeaf
              key={i}
              position={[Math.cos(a) * 0.04, 0.45 + (i % 3) * 0.09, Math.sin(a) * 0.04]}
              rotation={[0.12, a, Math.cos(a) * 0.18]}
              length={0.8 + (i % 2) * 0.12}
              color={leafColor}
            />
          );
        }

        if (crop === "Ginger" || crop === "Turmeric") {
          return (
            <BladeLeaf
              key={i}
              position={[Math.cos(a) * 0.1, 0.52 + (i % 2) * 0.08, Math.sin(a) * 0.1]}
              rotation={[0.1, a, Math.cos(a) * 0.3]}
              length={0.78}
              color={leafColor}
            />
          );
        }

        return (
          <Leaf
            key={i}
            position={[Math.cos(a) * 0.22, 0.42 + (i % 3) * 0.12, Math.sin(a) * 0.2]}
            rotation={[0.15, a, Math.cos(a) * 0.5]}
            scale={[1.05, 0.25, 0.62]}
            color={leafColor}
          />
        );
      })}
    </group>
  );
}

function LegumePlant({ crop, leafColor, stressed }) {
  const groundnut = crop === "Groundnut";
  const climbing = crop === "Beans" || crop === "Pea" || crop === "Cowpea";
  const nodes = groundnut ? 6 : crop === "Soybean" ? 7 : 8;

  return (
    <group>
      {(crop === "Beans" || crop === "Cowpea") && (
        <group>
          {[-0.32, 0.32].map((x) => (
            <mesh key={x} position={[x, 0.62, -0.06]}>
              <cylinderGeometry args={[0.018, 0.025, 1.25, 5]} />
              <meshStandardMaterial color="#8A6742" />
            </mesh>
          ))}
          <mesh position={[0, 0.72, -0.06]}>
            <cylinderGeometry args={[0.012, 0.012, 0.7, 5]} />
            <meshStandardMaterial color="#8A6742" />
          </mesh>
        </group>
      )}

      {groundnut ? (
        <mesh position={[0, 0.16, 0]} scale={[1.15, 0.55, 0.95]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial color={leafColor} />
        </mesh>
      ) : (
        Array.from({ length: climbing ? 3 : crop === "Soybean" ? 3 : 2 }, (_, i) => (
          <mesh
            key={`stem-${i}`}
            position={[(i - 1) * 0.12, 0.49, (i % 2) * 0.08]}
            rotation={[0, 0, climbing ? (i - 1) * 0.18 : 0]}
          >
            <cylinderGeometry args={[0.018, 0.03, climbing ? 1.05 : 0.82, 6]} />
            <meshStandardMaterial color="#43843B" />
          </mesh>
        ))
      )}

      {Array.from({ length: nodes }, (_, i) => {
        const angle = (i / nodes) * Math.PI * 2;
        const y = groundnut ? 0.24 + (i % 2) * 0.07 : 0.22 + (i % 4) * (climbing ? 0.18 : 0.11);
        const radius = groundnut ? 0.22 : 0.16 + (i % 2) * 0.06;
        const pos = [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
        return (
          <group key={`leaf-${i}`} position={pos} rotation={[0.12, angle, 0]}>
            {[-1, 0, 1].map((side) => (
              <Leaf
                key={side}
                position={[side * 0.075, Math.abs(side) * 0.025, 0]}
                rotation={[0.12, side * 0.25, side * 0.25]}
                scale={[0.52, 0.2, 0.38]}
                color={i % 3 === 0 ? "#66A94A" : leafColor}
              />
            ))}
          </group>
        );
      })}

      {!stressed && Array.from({ length: groundnut ? 3 : crop === "Soybean" ? 4 : 5 }, (_, i) => {
        const position = groundnut
          ? [(i - 1) * 0.15, 0.055 + (i % 2) * 0.025, 0.12]
          : [(i % 2 ? 1 : -1) * 0.18, 0.32 + (i % 4) * 0.14, 0.12];

        if (crop === "Pea" || crop === "Soybean") {
          return (
            <group key={`pod-${i}`} position={position} rotation={[0, 0, -0.18]}>
              <Fruit position={[0, 0, 0]} color={crop === "Pea" ? "#72A944" : "#87A949"} scale={[0.38, 1.3, 0.38]} />
              {[0, 1, 2].map((pea) => (
                <mesh key={pea} position={[0, -0.12 + pea * 0.1, 0.035]} scale={[0.12, 0.12, 0.12]}>
                  <sphereGeometry args={[0.1, 6, 5]} />
                  <meshStandardMaterial color={crop === "Pea" ? "#A5C95E" : "#6C913E"} />
                </mesh>
              ))}
            </group>
          );
        }

        return (
          <group key={`pod-${i}`} position={position}>
            <Fruit
              position={[0, 0, 0]}
              color={groundnut ? "#B98B4D" : crop === "Cowpea" ? "#6F873E" : "#5C9A45"}
              scale={groundnut ? [0.46, 0.7, 0.48] : crop === "Cowpea" ? [0.28, 1.55, 0.3] : [0.24, 1.7, 0.24]}
            />
            {crop === "Cowpea" && [-0.15, 0.04, 0.22].map((spot) => (
              <mesh key={spot} position={[0.025, spot, 0.06]} scale={[0.035, 0.025, 0.015]}>
                <sphereGeometry args={[1, 5, 4]} />
                <meshStandardMaterial color="#2F3424" />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function GrainPlant({ crop, leafColor, stemColor, stressed, plantIndex = 0 }) {
  const stalks = crop === "Maize" ? 1 : 3;
  const grainColor = stressed ? "#B7A34A" : "#D5B653";
  const plantVariation = (plantIndex % 5) - 2;

  return (
    <group>
      {Array.from({ length: stalks }, (_, i) => {
        const x = (i - (stalks - 1) / 2) * 0.12;
        const height = crop === "Maize" ? 1.65 : 1.15 + (i % 2) * 0.12;

        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, height / 2, 0]}>
              <cylinderGeometry args={[0.035, 0.055, height, 7]} />
              <meshStandardMaterial color={stemColor} />
            </mesh>

            {crop === "Maize"
              ? Array.from({ length: 7 }, (_, j) => {
                  const angle =
                    (j / 7) * Math.PI * 2 +
                    (j % 2 ? 0.22 : -0.12) +
                    i * 0.3 +
                    plantVariation * 0.055;
                  const level = 0.34 + j * 0.19 + plantVariation * 0.006;
                  const leafLength =
                    [0.96, 1.12, 1.02, 1.2, 0.94, 1.16, 0.9][j] *
                    (1 + plantVariation * 0.018);

                  return (
                    <MaizeLeaf
                      key={j}
                      position={[
                        Math.cos(angle) * 0.025,
                        level,
                        Math.sin(angle) * 0.025,
                      ]}
                      rotation={[
                        Math.sin(angle) * 0.12,
                        angle,
                        -0.3 + (j % 4) * 0.16,
                      ]}
                      length={leafLength}
                      color={leafColor}
                    />
                  );
                })
              : Array.from({ length: 5 }, (_, j) => {
                  const side = j % 2 ? 1 : -1;
                  return (
                    <BladeLeaf
                      key={j}
                      position={[side * 0.08, 0.27 + j * 0.16, 0]}
                      rotation={[0.1, j * 1.7, side * -0.48]}
                      length={crop === "Rice" ? 0.72 : 0.58}
                      color={leafColor}
                    />
                  );
                })}

            {crop === "Maize" && (
              <>
                <CornEar
                  position={[0.1, 0.82, 0.08]}
                  rotation={[0.08, plantVariation * 0.025, -0.14]}
                />
                <CornEar
                  position={[-0.09, 1.08, -0.08]}
                  rotation={[-0.08, plantVariation * -0.025, 0.16]}
                />
                <mesh position={[0, height + 0.14, 0]} castShadow>
                  <coneGeometry args={[0.07, 0.34, 7]} />
                  <meshStandardMaterial color="#B5A344" roughness={0.9} />
                </mesh>
              </>
            )}

            {crop === "Rice" && (
              <group position={[0, height - 0.04, 0]}>
                {[-1, 0, 1].map((side, j) => (
                  <group key={j} position={[side * 0.05, 0, 0]} rotation={[0, 0, 0.35 + side * 0.18]}>
                    <mesh position={[0, -0.13, 0]}>
                      <cylinderGeometry args={[0.012, 0.018, 0.3, 5]} />
                      <meshStandardMaterial color="#8E9A45" />
                    </mesh>
                    {Array.from({ length: 5 }, (_, k) => (
                      <Fruit key={k} position={[side * 0.045, -0.07 - k * 0.055, 0.025]} color={grainColor} scale={[0.22, 0.5, 0.25]} />
                    ))}
                  </group>
                ))}
              </group>
            )}

            {crop !== "Maize" && crop !== "Rice" && (
              <group position={[0, height + 0.04, 0]}>
                <mesh position={[0, 0.17, 0]} rotation={[0, 0, 0.08]}>
                  <cylinderGeometry args={[0.025, 0.04, 0.42, 6]} />
                  <meshStandardMaterial color="#A58B42" />
                </mesh>
                {Array.from({ length: crop === "Sorghum" ? 9 : crop === "Millet" ? 12 : 7 }, (_, k) => {
                  const angle = (k / (crop === "Millet" ? 12 : crop === "Sorghum" ? 9 : 7)) * Math.PI * 2;
                  const radius = crop === "Sorghum" ? 0.12 : crop === "Millet" ? 0.09 : 0.06;
                  const y = crop === "Oats" ? 0.12 - (k % 3) * 0.08 : 0.17 + (k % 3) * 0.08;
                  return (
                    <Fruit
                      key={k}
                      position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
                      color={crop === "Sorghum" ? "#9B593D" : crop === "Millet" ? "#C99C45" : grainColor}
                      scale={[0.25, crop === "Barley" ? 0.72 : 0.48, 0.25]}
                    />
                  );
                })}
                {(crop === "Barley" || crop === "Wheat") && Array.from({ length: crop === "Barley" ? 7 : 5 }, (_, k) => (
                  <BladeLeaf
                    key={`awn-${k}`}
                    position={[0, 0.31, 0]}
                    rotation={[0, k * (crop === "Barley" ? 0.9 : 1.25), crop === "Barley" ? -0.12 : 0.08]}
                    length={crop === "Barley" ? 0.62 : 0.4}
                    color={crop === "Barley" ? "#B69B48" : "#C8AD58"}
                  />
                ))}
                {crop === "Oats" && [-1, 0, 1].map((side) => (
                  <group
                    key={`oat-panicle-${side}`}
                    position={[side * 0.09, 0.2, 0]}
                    rotation={[0, 0, side * 0.42 + 0.25]}
                  >
                    <mesh position={[0, -0.08, 0]}>
                      <cylinderGeometry args={[0.009, 0.014, 0.28, 5]} />
                      <meshStandardMaterial color="#B69B48" />
                    </mesh>
                    {[0, 1, 2].map((kernel) => (
                      <Fruit
                        key={kernel}
                        position={[side * 0.045, -0.08 - kernel * 0.08, 0.02]}
                        color="#C8AD58"
                        scale={[0.24, 0.48, 0.24]}
                      />
                    ))}
                  </group>
                ))}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

function CashPlant({ crop, leafColor, stemColor, stressed }) {
  if (crop === "Sugarcane") {
    return (
      <group>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[(i - 1) * 0.16, 0, 0]}>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.055, 0.065, 1.4, 8]} />
              <meshStandardMaterial color="#729447" />
            </mesh>

            {[0, 1, 2].map((j) => (
              <Leaf
                key={j}
                position={[0.12 * (j % 2 ? -1 : 1), 0.48 + j * 0.32, 0]}
                rotation={[0, 0, (j % 2 ? -1 : 1) * 0.55]}
                scale={[1.5, 0.18, 0.3]}
                color={leafColor}
              />
            ))}
          </group>
        ))}
      </group>
    );
  }

  if (crop === "Sunflower") {
    return (
      <group>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 1.3, 7]} />
          <meshStandardMaterial color={stemColor} />
        </mesh>

        {[-1, 1].map((s) => (
          <Leaf
            key={s}
            position={[s * 0.16, 0.55, 0]}
            rotation={[0, 0, s * -0.5]}
            color={leafColor}
            scale={[1.1, 0.22, 0.45]}
          />
        ))}

        <mesh position={[0, 1.38, 0]}>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color="#8B5529" />
        </mesh>

        {Array.from({ length: 10 }, (_, i) => (
          <Fruit
            key={i}
            position={[
              Math.cos(i * Math.PI / 5) * 0.22,
              1.38 + Math.sin(i * Math.PI / 5) * 0.22,
              0,
            ]}
            color="#F2C33C"
            scale={[0.75, 0.75, 0.75]}
          />
        ))}
      </group>
    );
  }

  if (crop === "Cocoa") {
    return (
      <group>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.16, 1.42, 8]} />
          <meshStandardMaterial color="#765033" />
        </mesh>
        {[-1, 1].map((side, i) => (
          <mesh key={i} position={[side * 0.22, 1.12 + i * 0.12, 0]} rotation={[0, 0, side * 0.58]}>
            <cylinderGeometry args={[0.025, 0.055, 0.76, 6]} />
            <meshStandardMaterial color="#765033" />
          </mesh>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <Leaf
            key={`leaf-${i}`}
            position={[Math.cos(i * 1.7) * 0.38, 1.25 + (i % 3) * 0.18, Math.sin(i * 1.7) * 0.25]}
            rotation={[0.15, i * 1.7, Math.sin(i) * 0.42]}
            scale={[1.15, 0.24, 0.55]}
            color={leafColor}
          />
        ))}
        {!stressed && [0, 1, 2, 3].map((i) => (
          <group key={`pod-${i}`} position={[(i % 2 ? 1 : -1) * 0.2, 0.5 + i * 0.22, 0.12]}>
            <Fruit position={[0, 0, 0]} color={i % 2 ? "#A64D32" : "#7E4935"} scale={[0.72, 1.65, 0.72]} />
            {[0, 1, 2, 3].map((rib) => (
              <mesh key={rib} position={[(rib - 1.5) * 0.025, 0, 0.075]} scale={[0.09, 0.62, 0.045]}>
                <sphereGeometry args={[0.1, 6, 5]} />
                <meshStandardMaterial color="#C07842" roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  if (crop === "Coffee") {
    return (
      <group>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.07, 0.12, 1.08, 8]} />
          <meshStandardMaterial color="#765033" />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <Leaf
            key={`leaf-${i}`}
            position={[Math.cos(i * 1.6) * 0.3, 0.35 + (i % 5) * 0.2, Math.sin(i * 1.6) * 0.22]}
            rotation={[0.16, i * 1.6, Math.cos(i) * 0.3]}
            scale={[1.1, 0.24, 0.58]}
            color={i % 3 === 0 ? "#68A94B" : leafColor}
          />
        ))}
        {!stressed && Array.from({ length: 12 }, (_, i) => (
          <Fruit
            key={`berry-${i}`}
            position={[Math.cos(i * 2.4) * 0.25, 0.45 + (i % 5) * 0.14, Math.sin(i * 2.4) * 0.22]}
            color={i % 4 === 0 ? "#4E7E3B" : i % 3 === 0 ? "#D98B32" : "#B83B36"}
            scale={[0.42, 0.48, 0.42]}
          />
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, crop === "Tobacco" ? 0.7 : 0.62, 0]}>
        <cylinderGeometry args={[0.06, 0.08, crop === "Tobacco" ? 1.4 : 1.25, 8]} />
        <meshStandardMaterial color={stemColor} />
      </mesh>

      {Array.from({ length: crop === "Cotton" ? 7 : crop === "Sesame" ? 8 : 6 }, (_, i) => {
        const angle = i * 1.2;
        const y = 0.28 + (i % (crop === "Tobacco" ? 5 : 3)) * (crop === "Tobacco" ? 0.24 : 0.18);
        return (
          <group key={i} position={[Math.cos(angle) * 0.22, y, Math.sin(angle) * 0.18]}>
            <Leaf
              rotation={[0.2, angle, crop === "Tobacco" ? Math.cos(angle) * 0.24 : 0.3]}
              scale={crop === "Tobacco" ? [1.65, 0.28, 0.8] : [1.1, 0.24, 0.7]}
              color={leafColor}
            />
            {crop === "Sesame" && (
              <BladeLeaf position={[0, 0.02, 0]} rotation={[0.1, angle, 0.15]} length={0.62} color={leafColor} />
            )}
          </group>
        );
      })}

      {!stressed && crop === "Cotton" &&
        [0, 1, 2].map((i) => (
          <group key={i} position={[(i - 1) * 0.18, 0.8 + (i % 2) * 0.12, 0.08]}>
            <mesh>
              <sphereGeometry args={[0.12, 8, 7]} />
              <meshStandardMaterial color="#7A5734" />
            </mesh>
            {Array.from({ length: 4 }, (_, petal) => (
              <Fruit
                key={petal}
                position={[Math.cos(petal * Math.PI / 2) * 0.07, Math.sin(petal * Math.PI / 2) * 0.07, 0.03]}
                color="#F1F0E7"
                scale={[0.7, 0.86, 0.7]}
              />
            ))}
          </group>
        ))}

      {!stressed && crop === "Sesame" && [0, 1, 2, 3].map((i) => (
        <group key={i} position={[(i % 2 ? 1 : -1) * 0.12, 0.38 + i * 0.2, 0.08]}>
          <Fruit position={[0, 0, 0]} color="#A68A49" scale={[0.38, 0.85, 0.38]} />
          <mesh position={[0.035, 0.045, 0.04]} scale={[0.3, 0.24, 0.2]}>
            <sphereGeometry args={[0.12, 7, 5]} />
            <meshStandardMaterial color="#D5C3C4" />
          </mesh>
        </group>
      ))}

      {crop === "Tobacco" && (
        <mesh position={[0, 1.48, 0]}>
          <coneGeometry args={[0.16, 0.42, 7]} />
          <meshStandardMaterial color={stressed ? "#A99047" : "#9B72A2"} />
        </mesh>
      )}
    </group>
  );
}

function CropPlant({
  position,
  selectedCrop,
  scenario,
  irrigationActive,
  waterAvailability,
  plantIndex,
  isSelected,
  onSelect,
}) {
  const isDrought = scenario === "Drought";
  const isIrrigated =
    irrigationActive || scenario === "Drought + Irrigation";

  const waterPercent = Number.parseFloat(
    String(waterAvailability ?? "").replace("%", "").trim()
  );

  const stressed =
    (isDrought && !isIrrigated) ||
    (Number.isFinite(waterPercent) && waterPercent < 35);

  const stemColor = stressed ? "#9A8244" : "#43843B";
  const leafColor = stressed ? "#B7A34A" : "#55A630";

  const isFruit = fruitCrops.has(selectedCrop);
  const isLeafy = leafyCrops.has(selectedCrop);
  const isRoot = rootCrops.has(selectedCrop);
  const isLegume = legumeCrops.has(selectedCrop);
  const isGrain = grainCrops.has(selectedCrop);
  const isCash = cashCrops.has(selectedCrop);

  return (
    <group
      position={position}
      rotation={[0, (plantIndex % 5) * 0.24, 0]}
      scale={stressed ? 0.86 : 1}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(plantIndex);
      }}
    >
      <mesh
        position={[0, 0.92, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(plantIndex);
        }}
      >
        <cylinderGeometry args={[0.58, 0.58, 1.9, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {isSelected && (
        <mesh
          position={[0, 0.145, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.54, 0.045, 8, 36]} />
          <meshStandardMaterial
            color="#FFE36E"
            emissive="#B78518"
            emissiveIntensity={0.45}
          />
        </mesh>
      )}

      {!supportedCrops.has(selectedCrop) && (
        <group>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.045, 0.075, 0.84, 6]} />
            <meshStandardMaterial color="#C95042" />
          </mesh>
          <mesh position={[0, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.42, 0.08, 0.08]} />
            <meshStandardMaterial color="#F2C14E" />
          </mesh>
        </group>
      )}

      {isFruit && (
        <FruitPlant
          crop={selectedCrop}
          leafColor={leafColor}
          stressed={stressed}
        />
      )}

      {isLeafy && (
        <VegetablePlant
          crop={selectedCrop}
          leafColor={leafColor}
          stemColor={stemColor}
          stressed={stressed}
        />
      )}

      {isRoot && (
        <RootPlant crop={selectedCrop} leafColor={leafColor} />
      )}

      {isLegume && (
        <LegumePlant
          crop={selectedCrop}
          leafColor={leafColor}
          stressed={stressed}
        />
      )}

      {isGrain && (
        <GrainPlant
          crop={selectedCrop}
          leafColor={leafColor}
          stemColor={stemColor}
          stressed={stressed}
          plantIndex={plantIndex}
        />
      )}

      {isCash && (
        <CashPlant
          crop={selectedCrop}
          leafColor={leafColor}
          stemColor={stemColor}
          stressed={stressed}
        />
      )}

      {isIrrigated && (
        <mesh position={[0.34, 0.08, 0]}>
          <sphereGeometry args={[0.065, 8, 6]} />
          <meshStandardMaterial color="#2589D8" emissive="#125080" />
        </mesh>
      )}
    </group>
  );
}

function FarmBoundary() {
  const posts = [];
  for (let index = 0; index <= 6; index += 1) {
    const offset = -5.25 + index * 1.75;
    posts.push([-5.25, offset], [5.25, offset], [offset, -5.25], [offset, 5.25]);
  }

  return (
    <group>
      {posts.map(([x, z], index) => (
        <mesh key={`fence-post-${index}`} position={[x, 0.42, z]} castShadow>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? "#705337" : "#7C6041"}
            roughness={0.92}
          />
        </mesh>
      ))}
      {[-5.25, 5.25].flatMap((x) => [0.28, 0.62].map((y) => (
        <mesh key={`fence-x-${x}-${y}`} position={[x, y, 0]}>
          <boxGeometry args={[0.09, 0.08, 10.5]} />
          <meshStandardMaterial
            color={y < 0.4 ? "#856746" : "#90724F"}
            roughness={0.88}
          />
        </mesh>
      )))}
      {[-5.25, 5.25].flatMap((z) => [0.28, 0.62].map((y) => (
        <mesh key={`fence-z-${z}-${y}`} position={[0, y, z]}>
          <boxGeometry args={[10.5, 0.08, 0.09]} />
          <meshStandardMaterial
            color={y < 0.4 ? "#856746" : "#90724F"}
            roughness={0.88}
          />
        </mesh>
      )))}
    </group>
  );
}

function FieldTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.44, 7]} />
        <meshStandardMaterial color="#715039" roughness={1} />
      </mesh>
      {[
        [-0.25, 1.48, 0, 0.72],
        [0.22, 1.65, 0.08, 0.62],
        [0, 1.98, -0.05, 0.48],
      ].map(([x, y, z, radius], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          scale={[radius, radius * 0.82, radius]}
          castShadow
        >
          <dodecahedronGeometry args={[0.62, 1]} />
          <meshStandardMaterial
            color={index === 1 ? "#668447" : "#78934F"}
            roughness={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}

function FarmTrees() {
  return (
    <group>
      <FieldTree position={[-4.5, 0, -3.8]} scale={0.86} />
      <FieldTree position={[4.5, 0, 2.9]} scale={0.76} />
      <FieldTree position={[-4.55, 0, 4.1]} scale={0.62} />
    </group>
  );
}

function IrrigationFlow() {
  const particleRefs = useRef([]);
  const lineXs = [-2.25, -0.6, 1.05];
  const particlesPerLine = 3;

  useFrame(({ clock }) => {
    const travel = (clock.elapsedTime * 0.8) % 1;

    particleRefs.current.forEach((particle, index) => {
      if (!particle) return;

      const offset = (index % particlesPerLine) / particlesPerLine;
      const progress = (travel + offset) % 1;
      particle.position.z = -3.25 + progress * 6.5;
    });
  });

  return (
    <group>
      {lineXs.flatMap((x, lineIndex) =>
        Array.from({ length: particlesPerLine }, (_, particleIndex) => {
          const index = lineIndex * particlesPerLine + particleIndex;
          return (
            <mesh
              key={`flow-particle-${index}`}
              ref={(mesh) => {
                particleRefs.current[index] = mesh;
              }}
              position={[x, 0.2, -3.25 + particleIndex * 2.1]}
              scale={particleIndex === 1 ? 0.85 : 1}
            >
              <sphereGeometry args={[0.045, 7, 6]} />
              <meshBasicMaterial color="#70E5F6" />
            </mesh>
          );
        })
      )}
    </group>
  );
}

function IrrigationSystem({ active }) {
  const emitterZs = [-2.5, 0, 2.5];

  return (
    <group>
      <group position={[4.48, 0, -3.35]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.58, 1.44, 16]} />
          <meshStandardMaterial
            color="#718184"
            metalness={0.12}
            roughness={0.68}
          />
        </mesh>
        <mesh position={[0, 1.46, 0]}>
          <cylinderGeometry args={[0.53, 0.53, 0.08, 16]} />
          <meshStandardMaterial
            color="#526568"
            metalness={0.14}
            roughness={0.62}
          />
        </mesh>
        <mesh position={[0, active ? 1.25 : 0.93, 0]}>
          <cylinderGeometry args={[0.49, 0.49, 0.025, 16]} />
          <meshStandardMaterial
            color={active ? "#43B9D5" : "#315B68"}
            emissive={active ? "#11667C" : "#10272D"}
            roughness={0.34}
          />
        </mesh>
        {[[-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34]].map(([x, z], index) => (
          <mesh key={index} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.045, 0.055, 0.24, 7]} />
            <meshStandardMaterial color="#48585A" />
          </mesh>
        ))}
      </group>

      <mesh position={[4.08, 0.13, -3.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.8, 8]} />
        <meshStandardMaterial
          color={active ? "#238DB6" : "#344D51"}
          metalness={0.16}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[3.68, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 6.7, 8]} />
        <meshStandardMaterial
          color={active ? "#238DB6" : "#344D51"}
          metalness={0.16}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0.55, 0.13, -3.38]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 6.3, 8]} />
        <meshStandardMaterial
          color={active ? "#238DB6" : "#344D51"}
          metalness={0.16}
          roughness={0.48}
        />
      </mesh>

      {[-2.25, -0.6, 1.05].map((x) => (
        <mesh key={`drip-line-${x}`} position={[x, 0.145, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 7.45, 7]} />
          <meshStandardMaterial
            color={active ? "#36A6C3" : "#42585A"}
            metalness={0.12}
            roughness={0.52}
          />
        </mesh>
      ))}

      {active && emitterZs.flatMap((z) => [-2.25, -0.6, 1.05].map((x) => (
        <group key={`active-emitter-${x}-${z}`} position={[x, 0.18, z]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.22, 6]} />
            <meshStandardMaterial color="#64D8EE" emissive="#1A89A5" />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <sphereGeometry args={[0.055, 7, 5]} />
            <meshStandardMaterial
              color="#7CE5F4"
              emissive="#238BA1"
              transparent
              opacity={0.82}
            />
          </mesh>
          <mesh position={[0.04, 0.18, 0.035]} scale={[0.035, 0.065, 0.035]}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshStandardMaterial color="#69D7EA" transparent opacity={0.75} />
          </mesh>
        </group>
      )))}
      {active && <IrrigationFlow />}
    </group>
  );
}

function FarmScene({
  selectedCrop,
  soilType,
  scenario,
  irrigationActive = false,
  waterAvailability = "74%",
  plantCount = 12,
  selectedPlantIndex,
  onSelectPlant,
  selectedBedIndex,
  onSelectBed,
}) {
  const { positions, plantBedIndexes } = getPlantLayout(plantCount);
  const waterPercent = Number.parseFloat(
    String(waterAvailability ?? "").replace("%", "").trim()
  );
  const isIrrigated =
    irrigationActive || scenario === "Drought + Irrigation";
  const lowWater = Number.isFinite(waterPercent) && waterPercent < 35;
  const isDry = !isIrrigated && (scenario === "Drought" || lowWater);

  return (
    <>
      <color attach="background" args={["#D8D0B2"]} />
      <SkyDome />
      <DistantScenery />
      <FarmTerrain />
      <fog attach="fog" args={["#D8D0B2", 18, 38]} />
      <hemisphereLight args={["#E6F0E7", "#70583D", 0.94]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-5, 10, 6]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
        shadow-bias={-0.00015}
        shadow-normalBias={0.025}
        shadow-radius={6}
      />
      <directionalLight position={[4, 5, -5]} intensity={0.58} />

      <Ground
        soilType={soilType}
        isDry={isDry}
        isIrrigated={isIrrigated}
        plantPositions={positions}
        plantBedIndexes={plantBedIndexes}
        selectedBedIndex={selectedBedIndex}
        onSelectBed={onSelectBed}
      />
      <FarmBoundary />
      <FarmTrees />

      <IrrigationSystem active={isIrrigated} />

      {positions.map((position, index) => (
        <CropPlant
          key={`${selectedCrop}-${index}`}
          position={position}
          selectedCrop={selectedCrop}
          scenario={scenario}
          irrigationActive={isIrrigated}
          waterAvailability={waterAvailability}
          plantIndex={index}
          isSelected={selectedPlantIndex === index}
          onSelect={onSelectPlant}
        />
      ))}
    </>
  );
}

export default function Farm3D({
  selectedCrop = "Maize",
  soilType = "Sandy",
  scenario = "Normal",
  irrigationActive = false,
  waterAvailability = "74%",
  plantCount = 12,
}) {
  const { count, plantsPerBed } = getPlantLayout(plantCount);
  const [selection, setSelection] = useState({ plantIndex: null, count });
  const [selectedBedIndex, setSelectedBedIndex] = useState(null);
  if (selection.count !== count) {
    setSelection({ plantIndex: null, count });
  }
  const selectedPlantIndex = selection.plantIndex;
  const waterPercent = Number.parseFloat(
    String(waterAvailability ?? "").replace("%", "").trim()
  );
  const lowWater = Number.isFinite(waterPercent) && waterPercent < 35;
  const isIrrigated =
    irrigationActive || scenario === "Drought + Irrigation";
  const scenarioStatus =
    scenario === "Drought"
      ? isIrrigated
        ? "Drought; irrigation active"
        : "Drought"
      : lowWater
        ? isIrrigated
          ? "Low water; irrigation active"
          : "Low water"
        : isIrrigated
          ? "Irrigation active"
          : scenario;

  const selectPlant = (index) => {
    setSelectedBedIndex(null);
    setSelection({ plantIndex: index, count });
  };
  const selectBed = (index) => {
    setSelection({ plantIndex: null, count });
    setSelectedBedIndex(index);
  };
  const clearSelection = () => {
    setSelectedBedIndex(null);
    setSelection({ plantIndex: null, count });
  };

  return (
    <div
      className="farm-scene"
      style={{
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#D8D0B2",
        position: "relative",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [8, 8.5, 9.8], fov: 48 }}
        onPointerMissed={clearSelection}
      >
        <FarmScene
          selectedCrop={selectedCrop}
          soilType={soilType}
          scenario={scenario}
          irrigationActive={isIrrigated}
          waterAvailability={waterAvailability}
          plantCount={plantCount}
          selectedPlantIndex={selectedPlantIndex}
          onSelectPlant={selectPlant}
          selectedBedIndex={selectedBedIndex}
          onSelectBed={selectBed}
        />
      </Canvas>

      {selectedPlantIndex !== null && (
        <section
          aria-label="Selected plant inspection"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "min(230px, calc(100% - 24px))",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid rgba(219, 242, 225, 0.35)",
            borderRadius: "12px",
            background: "rgba(14, 30, 22, 0.92)",
            color: "#F1F5F2",
            fontSize: "13px",
            lineHeight: 1.5,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <strong>Plant {selectedPlantIndex + 1}</strong>
            <button
              type="button"
              aria-label="Close plant inspection"
              onClick={clearSelection}
              style={{
                padding: "2px 7px",
                border: "0",
                borderRadius: "6px",
                color: "#F1F5F2",
                background: "#31543C",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ×
            </button>
          </div>
          <div>Crop: <strong>{selectedCrop}</strong></div>
          <div>Soil: <strong>{soilType}</strong></div>
          <div>Water: <strong>{waterAvailability}</strong></div>
          <div>Status: <strong>{scenarioStatus}</strong></div>
          <div>Growth stage: <strong>Not simulated</strong></div>
        </section>
      )}
      {selectedBedIndex !== null && (
        <section
          aria-label="Selected crop bed inspection"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "min(230px, calc(100% - 24px))",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid rgba(219, 242, 225, 0.35)",
            borderRadius: "12px",
            background: "rgba(14, 30, 22, 0.92)",
            color: "#F1F5F2",
            fontSize: "13px",
            lineHeight: 1.5,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <strong>Bed {selectedBedIndex + 1}</strong>
            <button
              type="button"
              aria-label="Close crop bed inspection"
              onClick={clearSelection}
              style={{
                padding: "2px 7px",
                border: "0",
                borderRadius: "6px",
                color: "#F1F5F2",
                background: "#31543C",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ×
            </button>
          </div>
          <div>
            Crop:{" "}
            <strong>
              {plantsPerBed[selectedBedIndex] > 0
                ? selectedCrop
                : "No crop planted"}
            </strong>
          </div>
          <div>
            Plants: <strong>{plantsPerBed[selectedBedIndex]}</strong>
          </div>
          <div>Soil: <strong>{soilType}</strong></div>
          <div>Water: <strong>{waterAvailability}</strong></div>
          <div>Condition: <strong>{scenarioStatus}</strong></div>
        </section>
      )}
    </div>
  );
}
