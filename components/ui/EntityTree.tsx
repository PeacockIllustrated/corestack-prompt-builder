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
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

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

    // Recursive function to update a node's name
    const updateNodeName = (nodes: EntityNode[], nodeId: string, newName: string): EntityNode[] => {
        return nodes.map((node) => {
            if (node.id === nodeId) {
                return { ...node, name: newName };
            }
            if (node.children.length > 0) {
                return { ...node, children: updateNodeName(node.children, nodeId, newName) };
            }
            return node;
        });
    };

    const handleAddOrUpdate = () => {
        if (!newNodeName.trim()) return;

        if (editingNodeId) {
            // Update existing node
            onChange(updateNodeName(value, editingNodeId, newNodeName.trim()));
            setEditingNodeId(null);
            setNewNodeName("");
            return;
        }

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
            handleAddOrUpdate();
        }
    };

    const startEditing = (e: React.MouseEvent, node: EntityNode) => {
        e.stopPropagation();
        setEditingNodeId(node.id);
        setNewNodeName(node.name);
        // If we are editing, we shouldn't be selecting for child addition simultaneously to avoid confusion
        setSelectedNodeId(null);
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
              ${editingNodeId === node.id ? "bg-green-700/40 text-white animate-pulse" : ""}
            `}
                        onClick={() => {
                            if (editingNodeId) return; // Disable selection while editing
                            setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
                        }}
                    >
                        <span className="font-mono text-green-600 mr-2 whitespace-pre">{prefix}</span>
                        <span className="font-mono text-sm flex-1">{node.name}</span>

                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => startEditing(e, node)}
                                className="text-xs text-green-600 hover:text-green-300 px-2"
                            >
                                [EDT]
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(removeNode(value, node.id));
                                    if (selectedNodeId === node.id) setSelectedNodeId(null);
                                    if (editingNodeId === node.id) {
                                        setEditingNodeId(null);
                                        setNewNodeName("");
                                    }
                                }}
                                className="text-xs text-green-800 hover:text-red-500 px-2"
                            >
                                [DEL]
                            </button>
                        </div>
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

            <div className="flex flex-col gap-2">
                {/* Helper text moved here for better layout */}
                {selectedNodeId && !editingNodeId && (
                    <div className="text-[10px] text-green-600 px-1">
                        &gt; Adding child to selected node...
                    </div>
                )}
                {editingNodeId && (
                    <div className="text-[10px] text-yellow-600 px-1">
                        &gt; Editing node name...
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            editingNodeId
                                ? "Update node name..."
                                : selectedNodeId
                                    ? "Enter child name..."
                                    : "Enter root entity name..."
                        }
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleAddOrUpdate} variant="secondary">
                        {editingNodeId
                            ? "[ UPDATE ]"
                            : selectedNodeId
                                ? "[ + CHILD ]"
                                : "[ + ROOT ]"
                        }
                    </Button>
                    {(selectedNodeId || editingNodeId) && (
                        <Button
                            type="button"
                            onClick={() => {
                                setSelectedNodeId(null);
                                setEditingNodeId(null);
                                setNewNodeName("");
                            }}
                            className="px-3 border-dashed opacity-50 hover:opacity-100"
                        >
                            [ CANCEL ]
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
