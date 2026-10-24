
import { Canvas } from "@react-three/fiber";
import { Shape } from "three";

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

function Ground({ soilType }) {
  const soilColors = {
    Sandy: "#C2A16B",
    Clay: "#8B5E3C",
    Loamy: "#654321",
    Silt: "#8A8060",
  };
  const soilColor = soilColors[soilType] || "#654321";

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color={soilColor}
          roughness={1}
        />
      </mesh>

      {[-1.65, 0, 1.65].map((x) => (
        <mesh
          key={`bed-${x}`}
          position={[x, 0.015, 0]}
          scale={[0.55, 0.1, 5.3]}
        >
          <sphereGeometry args={[1, 18, 10]} />
          <meshStandardMaterial color={soilColor} roughness={1} />
        </mesh>
      ))}

      {[-2.48, -0.82, 0.82, 2.48].map((x) => (
        <mesh
          key={`furrow-${x}`}
          position={[x, -0.012, 0]}
          scale={[0.12, 0.012, 5.15]}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#493622" roughness={1} />
        </mesh>
      ))}

      {Array.from({ length: 24 }, (_, i) => {
        const x = Math.sin(i * 12.9898) * 4.8;
        const z = Math.sin(i * 78.233) * 4.8;
        const size = 0.035 + (i % 3) * 0.012;

        return (
          <mesh
            key={`soil-clod-${i}`}
            position={[x, -0.006, z]}
            scale={[size * 1.5, 0.012, size]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={i % 2 ? "#8C704A" : "#705638"} roughness={1} />
          </mesh>
        );
      })}
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

const maizeLeafShape = new Shape();
maizeLeafShape.moveTo(0, 0);
maizeLeafShape.quadraticCurveTo(0.28, 0.13, 0.63, 0.12);
maizeLeafShape.quadraticCurveTo(0.88, 0.1, 1, 0);
maizeLeafShape.quadraticCurveTo(0.72, -0.1, 0.42, -0.11);
maizeLeafShape.quadraticCurveTo(0.12, -0.08, 0, 0);

function MaizeLeaf({ position, rotation, length, color }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[length, 1, 1]}
      castShadow
    >
      <shapeGeometry args={[maizeLeafShape]} />
      <meshStandardMaterial color={color} roughness={0.82} side={2} />
    </mesh>
  );
}

function CornEar({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={[0.105, 0.34, 0.105]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#E7B735" roughness={0.62} />
      </mesh>

      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 4 }, (_, kernel) => {
          const angle = (kernel / 4) * Math.PI * 2 + (row % 2) * 0.22;
          const y = (row - 2) * 0.105;

          return (
            <mesh
              key={`${row}-${kernel}`}
              position={[
                Math.cos(angle) * 0.1,
                y,
                Math.sin(angle) * 0.1,
              ]}
              scale={[0.028, 0.042, 0.028]}
              castShadow
            >
              <sphereGeometry args={[1, 7, 6]} />
              <meshStandardMaterial color="#F5D15B" roughness={0.56} />
            </mesh>
          );
        })
      )}

      <MaizeLeaf
        position={[-0.035, -0.1, 0.025]}
        rotation={[0.12, 0, -0.8]}
        length={0.38}
        color="#4B873B"
      />
      <MaizeLeaf
        position={[0.035, -0.12, -0.025]}
        rotation={[-0.12, Math.PI, 0.82]}
        length={0.36}
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

  if (crop === "Strawberry" || crop === "Watermelon") {
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

        {!stressed &&
          (crop === "Strawberry"
            ? [[-0.2, 0.13, 0.08], [0.18, 0.14, -0.08], [0.05, 0.12, 0.2]]
            : [[-0.13, 0.2, 0], [0.2, 0.2, 0.05]]
          ).map((p, i) => (
            <Fruit
              key={i}
              position={p}
              color={crop === "Strawberry" ? "#D93645" : "#4F9148"}
              scale={
                crop === "Strawberry"
                  ? [0.72, 1, 0.72]
                  : [1.8, 1.1, 1.25]
              }
            />
          ))}
      </group>
    );
  }

  // Orange, apple, lemon, guava and papaya.
  return (
    <group>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.35, 9]} />
        <meshStandardMaterial color="#795438" />
      </mesh>

      {[
        [0, 1.55, 0],
        [-0.32, 1.38, 0.04],
        [0.3, 1.4, 0.1],
        [0, 1.78, 0.1],
        [-0.1, 1.55, -0.27],
        [0.22, 1.62, -0.22],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p}
          scale={crop === "Papaya" ? [0.75, 1.2, 0.75] : [1.1, 0.85, 1]}
          castShadow
        >
          <sphereGeometry args={[0.38, 12, 10]} />
          <meshStandardMaterial color={leafColor} roughness={0.85} />
        </mesh>
      ))}

      {!stressed &&
        canopyPositions
          .slice(0, crop === "Papaya" ? 4 : 5)
          .map((p, i) => (
            <Fruit
              key={i}
              position={[
                p[0] * 0.85,
                crop === "Papaya" ? 1.1 + (i % 3) * 0.18 : 1.38 + (i % 2) * 0.2,
                p[2] + 0.1,
              ]}
              color={colors[i % colors.length]}
              scale={crop === "Papaya" ? [0.9, 1.6, 0.9] : [0.9, 0.95, 0.9]}
            />
          ))}
    </group>
  );
}

function VegetablePlant({ crop, leafColor, stemColor, stressed }) {
  const leafCount = crop === "Cabbage" || crop === "Lettuce" ? 9 : 6;

  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 0.58, 7]} />
        <meshStandardMaterial color={stemColor} />
      </mesh>

      {Array.from({ length: leafCount }, (_, i) => {
        const a = (i / leafCount) * Math.PI * 2;
        const broad = ["Cabbage", "Lettuce", "Spinach"].includes(crop);

        return (
          <Leaf
            key={i}
            position={[
              Math.cos(a) * (broad ? 0.25 : 0.2),
              0.35 + (i % 3) * 0.09,
              Math.sin(a) * (broad ? 0.25 : 0.2),
            ]}
            rotation={[0.18, a, Math.cos(a) * 0.45]}
            scale={broad ? [1.25, 0.28, 1.05] : [1.15, 0.25, 0.48]}
            color={leafColor}
          />
        );
      })}

      {!stressed &&
        (crop === "Tomato" || crop === "Pepper") &&
        [[-0.13, 0.52, 0.08], [0.16, 0.45, -0.08], [0.04, 0.62, 0.12]].map((p, i) => (
          <Fruit
            key={i}
            position={p}
            color={crop === "Tomato" ? "#D83C32" : ["#D83C32", "#4D9B42"][i % 2]}
            scale={crop === "Pepper" ? [0.8, 1.3, 0.8] : [1.05, 1.05, 1.05]}
          />
        ))}

      {!stressed && crop === "Cucumber" && (
        <Fruit position={[0.22, 0.24, 0.08]} color="#3C8A43" scale={[0.55, 1.9, 0.55]} />
      )}

      {!stressed && crop === "Okra" && (
        <Fruit position={[0.12, 0.52, 0.06]} color="#4D8A43" scale={[0.45, 1.8, 0.45]} />
      )}
    </group>
  );
}

function RootPlant({ crop, leafColor }) {
  const leafCount = crop === "Cassava" ? 7 : 5;

  return (
    <group>
      {crop === "Carrot" && (
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.13, 0.52, 8]} />
          <meshStandardMaterial color="#E98B2A" />
        </mesh>
      )}

      {crop === "Onion" && (
        <mesh position={[0, 0.13, 0]} scale={[0.85, 0.8, 0.85]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color="#D4B36A" />
        </mesh>
      )}

      {(crop === "Potato" || crop === "Sweet Potato" || crop === "Yam") && (
        <mesh
          position={[0, 0.1, 0]}
          rotation={[0.2, 0, 0.35]}
          scale={crop === "Yam" ? [0.8, 1.5, 0.8] : [1.1, 0.75, 0.8]}
        >
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial
            color={crop === "Potato" ? "#B99462" : crop === "Yam" ? "#A17B51" : "#C77E4A"}
          />
        </mesh>
      )}

      {(crop === "Ginger" || crop === "Turmeric") && (
        <mesh position={[0, 0.12, 0]} scale={[1.3, 0.55, 0.8]}>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color={crop === "Ginger" ? "#B9955B" : "#D99A24"} />
        </mesh>
      )}

      {Array.from({ length: leafCount }, (_, i) => {
        const a = (i / leafCount) * Math.PI * 2;

        if (crop === "Cassava") {
          return (
            <group
              key={i}
              position={[Math.cos(a) * 0.12, 0.52, Math.sin(a) * 0.12]}
              rotation={[0.2, a, Math.cos(a) * 0.25]}
            >
              <mesh scale={[0.25, 0.7, 0.06]}>
                <coneGeometry args={[0.22, 0.7, 5]} />
                <meshStandardMaterial color={leafColor} />
              </mesh>
            </group>
          );
        }

        return (
          <Leaf
            key={i}
            position={[Math.cos(a) * 0.2, 0.38 + (i % 2) * 0.08, Math.sin(a) * 0.2]}
            rotation={[0.15, a, Math.cos(a) * 0.5]}
            scale={[0.8, 0.22, 0.45]}
            color={leafColor}
          />
        );
      })}
    </group>
  );
}

function LegumePlant({ crop, leafColor, stressed }) {
  return (
    <group>
      {[
        [-0.16, 0.26, 0],
        [0.12, 0.3, 0.04],
        [0, 0.43, -0.06],
        [0.2, 0.42, 0.08],
      ].map((p, i) => (
        <Leaf
          key={i}
          position={p}
          rotation={[0.15, i * 1.3, i % 2 ? -0.3 : 0.3]}
          scale={[0.95, 0.24, 0.58]}
          color={leafColor}
        />
      ))}

      {!stressed &&
        (crop === "Groundnut"
          ? [[-0.15, 0.1, 0.08], [0.12, 0.1, -0.06]]
          : [[-0.14, 0.34, 0.1], [0.15, 0.38, 0.06]]
        ).map((p, i) => (
          <Fruit
            key={i}
            position={p}
            color={crop === "Groundnut" ? "#B98B4D" : "#79A64A"}
            scale={crop === "Groundnut" ? [0.65, 0.85, 0.65] : [0.48, 1.6, 0.48]}
          />
        ))}
    </group>
  );
}

function GrainPlant({ crop, leafColor, stemColor, stressed }) {
  const stalks = crop === "Maize" ? 1 : 3;

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
              ? Array.from({ length: 6 }, (_, j) => {
                  const angle = (j / 6) * Math.PI * 2 + (i % 2) * 0.3;
                  const level = 0.34 + j * 0.19;

                  return (
                    <MaizeLeaf
                      key={j}
                      position={[0, level, 0]}
                      rotation={[
                        0,
                        angle,
                        -0.22 + (j % 3) * 0.1,
                      ]}
                      length={1.1 + (j % 3) * 0.12}
                      color={leafColor}
                    />
                  );
                })
              : [-1, 1, -1].map((side, j) => (
                  <Leaf
                    key={j}
                    position={[side * 0.15, 0.35 + j * 0.3, 0.02]}
                    rotation={[0.1, 0, side * -0.45]}
                    scale={[1.15, 0.17, 0.27]}
                    color={leafColor}
                  />
                ))}

            {crop === "Maize" && (
              <>
                <CornEar
                  position={[0.1, 0.82, 0.08]}
                  rotation={[0.08, 0, -0.14]}
                />
                <CornEar
                  position={[-0.09, 1.08, -0.08]}
                  rotation={[-0.08, 0, 0.16]}
                />
                <mesh position={[0, height + 0.14, 0]} castShadow>
                  <coneGeometry args={[0.07, 0.34, 7]} />
                  <meshStandardMaterial color="#B5A344" roughness={0.9} />
                </mesh>
              </>
            )}

            {crop !== "Maize" && (
              <mesh position={[0, height + 0.08, 0]} rotation={[0, 0, 0.08]}>
                <coneGeometry args={[0.09, 0.42, 7]} />
                <meshStandardMaterial color={stressed ? "#B7A34A" : "#C6A74A"} />
              </mesh>
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

  return (
    <group>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.25, 8]} />
        <meshStandardMaterial color={stemColor} />
      </mesh>

      {Array.from({ length: crop === "Cotton" ? 7 : 5 }, (_, i) => (
        <Leaf
          key={i}
          position={[Math.cos(i * 1.2) * 0.22, 0.35 + (i % 3) * 0.18, Math.sin(i * 1.2) * 0.18]}
          rotation={[0.2, i, 0.3]}
          scale={[1.1, 0.24, 0.7]}
          color={leafColor}
        />
      ))}

      {!stressed && crop === "Cotton" &&
        [0, 1, 2].map((i) => (
          <Fruit
            key={i}
            position={[(i - 1) * 0.18, 0.8 + (i % 2) * 0.12, 0.08]}
            color="#F1F0E7"
            scale={[1.05, 1.05, 1.05]}
          />
        ))}

      {!stressed && crop === "Cocoa" &&
        [0, 1, 2].map((i) => (
          <Fruit
            key={i}
            position={[(i - 1) * 0.2, 0.7 + (i % 2) * 0.16, 0.14]}
            color="#8D4B32"
            scale={[0.75, 1.6, 0.75]}
          />
        ))}

      {!stressed && crop === "Coffee" &&
        [0, 1, 2, 3].map((i) => (
          <Fruit
            key={i}
            position={[Math.cos(i * 1.6) * 0.2, 0.6 + (i % 2) * 0.12, 0.14]}
            color="#B64035"
            scale={[0.65, 0.72, 0.65]}
          />
        ))}
    </group>
  );
}

function CropPlant({ position, selectedCrop, scenario, waterAvailability }) {
  const isDrought = scenario === "Drought";
  const isIrrigated = scenario === "Drought + Irrigation";

  const waterPercent = Number.parseFloat(
    String(waterAvailability ?? "").replace("%", "").trim()
  );

  const stressed =
    isDrought ||
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
    <group position={position} scale={stressed ? 0.86 : 1}>
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

function IrrigationSystem() {
  return (
    <group>
      {[-2, 0, 2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
            <meshStandardMaterial color="#2589D8" />
          </mesh>

          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#64C7F4" emissive="#135C8A" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FarmScene({
  selectedCrop,
  soilType,
  scenario,
  waterAvailability = "74%",
  plantCount = 6,
}) {
  const count = Math.max(1, Math.min(plantCount || 6, 12));
  const columns = Math.min(3, count);
  const rows = Math.ceil(count / columns);

  const positions = Array.from({ length: count }, (_, index) => [
    (index % columns) * 1.65 - ((columns - 1) * 1.65) / 2,
    0,
    Math.floor(index / columns) * 1.65 - ((rows - 1) * 1.65) / 2,
  ]);

  return (
    <>
      <color attach="background" args={["#9BD8EA"]} />
      <hemisphereLight args={["#E1F5FC", "#776044", 1.05]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[-4, 9, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[4, 4, -5]} intensity={0.55} />

      <Ground soilType={soilType} />

      {scenario === "Drought + Irrigation" && <IrrigationSystem />}

      {positions.map((position, index) => (
        <CropPlant
          key={`${selectedCrop}-${index}`}
          position={position}
          selectedCrop={selectedCrop}
          scenario={scenario}
          waterAvailability={waterAvailability}
        />
      ))}
    </>
  );
}

export default function Farm3D({
  selectedCrop = "Maize",
  soilType = "Sandy",
  scenario = "Normal",
  waterAvailability = "74%",
  plantCount = 6,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#9BD8EA",
      }}
    >
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [7, 6, 8], fov: 50 }}>
        <FarmScene
          selectedCrop={selectedCrop}
          soilType={soilType}
          scenario={scenario}
          waterAvailability={waterAvailability}
          plantCount={plantCount}
        />
      </Canvas>
    </div>
  );
}
