import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
// Import actual JS values normally
import sectionService from "../../services/section.service";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// Import types using `import type`
import type {
  Section,
  CreateSectionData,
} from "../../services/section.service";
import type { DragEndEvent } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSection({
  section,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  section: Section;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 flex items-center justify-between shadow ${
        !section.is_visible ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          ⋮⋮
        </button>
        <div className="flex-1">
          <h3 className="font-semibold">{section.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">
            {section.content}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleVisibility(section.id, !section.is_visible)}
          className="text-sm px-3 py-1 rounded hover:bg-gray-100"
        >
          {section.is_visible ? "👁️" : "👁️‍🗨️"}
        </button>
        <button
          onClick={() => onEdit(section)}
          className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded bg-indigo-100  flex items-center gap-1"
        >
          ✏️ Edit
        </button>

        <button
          onClick={() => onDelete(section.id)}
          className="text-red-600 hover:text-red-800 px-3 py-1 rounded  bg-red-100 "
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function SectionEditor() {
  const { company } = useAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<CreateSectionData>({
    title: "",
    content: "",
    sectionType: "custom",
    isVisible: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadSections();
  }, [company]);

  const loadSections = async () => {
    if (!company) return;

    try {
      const data = await sectionService.getSections(company.slug);
      setSections(data);
    } catch (error) {
      console.error("Failed to load sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      try {
        await sectionService.reorderSections(
          company!.slug,
          newSections.map((s) => s.id)
        );
      } catch (error) {
        console.error("Failed to reorder:", error);
        setSections(sections); // Revert on error
      }
    }
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      if (editingSection) {
        await sectionService.updateSection(
          company.slug,
          editingSection.id,
          formData
        );
      } else {
        await sectionService.createSection(company.slug, formData);
      }

      await loadSections();
      setShowModal(false);
      setEditingSection(null);
      setFormData({
        title: "",
        content: "",
        sectionType: "custom",
        isVisible: true,
      });
    } catch (error) {
      console.error("Failed to save section:", error);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      sectionType: section.section_type,
      isVisible: section.is_visible,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!company || !confirm("Delete this section?")) return;

    try {
      await sectionService.deleteSection(company.slug, id);
      await loadSections();
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    if (!company) return;

    try {
      await sectionService.updateSection(company.slug, id, { isVisible });
      await loadSections();
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Manage Page Sections</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 mb-6">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No sections yet. Add your first section!
        </div>
      )}

      <button
        onClick={() => {
          setEditingSection(null);
          setFormData({
            title: "",
            content: "",
            sectionType: "custom",
            isVisible: true,
          });
          setShowModal(true);
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
      >
        + Add Section
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingSection ? "Edit Section" : "Add New Section"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., About Us"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Section content..."
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Section Type</label>
                <select
                  value={formData.sectionType}
                  onChange={(e) =>
                    setFormData({ ...formData, sectionType: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="about">About</option>
                  <option value="culture">Culture</option>
                  <option value="benefits">Benefits</option>
                  <option value="values">Values</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isVisible: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label>Visible on public page</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSection(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
