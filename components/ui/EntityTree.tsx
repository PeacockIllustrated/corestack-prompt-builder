import React, { useState } from "react";
import { Label } from "./Label";
import { Button } from "./Button";
import { Input } from "./Input";

export interface EntityNode {
    id: string;
    name: string;
    children: EntityNode[];
}

interface EntityTreeProps {
    label: string;
    value: EntityNode[];
    onChange: (nodes: EntityNode[]) => void;
}

export const EntityTree: React.FC<EntityTreeProps> = ({
    label,
    value,
    onChange,
}) => {
    const [newNodeName, setNewNodeName] = useState("");
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Recursive function to add a child to a specific node
    const addChildToNode = (nodes: EntityNode[], parentId: string, childName: string): EntityNode[] => {
        return nodes.map((node) => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [
                        ...node.children,
                        { id: Math.random().toString(36).substr(2, 9), name: childName, children: [] },
                    ],
                };
            }
            if (node.children.length > 0) {
                return { ...node, children: addChildToNode(node.children, parentId, childName) };
            }
            return node;
        });
    };

    // Recursive function to remove a node
    const removeNode = (nodes: EntityNode[], nodeId: string): EntityNode[] => {
        return nodes
            .filter((node) => node.id !== nodeId)
            .map((node) => ({
                ...node,
                children: removeNode(node.children, nodeId),
            }));
    };

    const handleAdd = () => {
        if (!newNodeName.trim()) return;

        if (selectedNodeId) {
            // Add as child
            onChange(addChildToNode(value, selectedNodeId, newNodeName.trim()));
        } else {
            // Add as root
            onChange([
                ...value,
                { id: Math.random().toString(36).substr(2, 9), name: newNodeName.trim(), children: [] },
            ]);
        }
        setNewNodeName("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    // Recursive renderer for tree nodes
    const renderTree = (nodes: EntityNode[], depth = 0, isLastMap: boolean[] = []) => {
        return nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;
            const currentIsLastMap = [...isLastMap, isLast];

            // Generate ASCII prefix
            let prefix = "";
            for (let i = 0; i < depth; i++) {
                prefix += isLastMap[i] ? "    " : "│   ";
            }
            prefix += isLast ? "└── " : "├── ";

            return (
                <div key={node.id}>
                    <div
                        className={`
              flex items-center group cursor-pointer py-1 px-2
              ${selectedNodeId === node.id ? "bg-green-900/30 text-green-300" : "hover:bg-green-900/10"}
            `}
                        onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                    >
                        <span className="font-mono text-green-600 mr-2 whitespace-pre">{prefix}</span>
                        <span className="font-mono text-sm flex-1">{node.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(removeNode(value, node.id));
                                if (selectedNodeId === node.id) setSelectedNodeId(null);
                            }}
                            className="text-xs text-green-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                        >
                            [DEL]
                        </button>
                    </div>
                    {node.children.length > 0 && renderTree(node.children, depth + 1, currentIsLastMap)}
                </div>
            );
        });
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            <div className="border border-green-800 bg-black p-2 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
                {value.length === 0 ? (
                    <div className="text-green-900 text-sm italic p-2">// No entities yet. Add one below.</div>
                ) : (
                    renderTree(value)
                )}
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    {selectedNodeId && (
                        <div className="absolute -top-5 left-0 text-[10px] text-green-600">
                            Adding child to selected node...
                        </div>
                    )}
                    <Input
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedNodeId ? "Enter child name..." : "Enter root entity name..."}
                        className="w-full"
                    />
                </div>
                <Button type="button" onClick={handleAdd} variant="secondary">
                    {selectedNodeId ? "[ + CHILD ]" : "[ + ROOT ]"}
                </Button>
                {selectedNodeId && (
                    <Button type="button" onClick={() => setSelectedNodeId(null)} className="px-3 border-dashed opacity-50 hover:opacity-100">
                        [ DESELECT ]
                    </Button>
                )}
            </div>
        </div>
    );
};
