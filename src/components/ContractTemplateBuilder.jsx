import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Save, Eye, Users, Settings,
  Type, Radio, ChevronDown, MessageSquare,
  Calendar, Hash, Mail, Phone, MapPin,
  Edit, Trash2, Copy, Check, X, ArrowLeft, ArrowRight,
  Bold, Italic, Underline, List, ListOrdered, AlignLeft,
  AlignCenter, AlignRight, Link, Image, Quote
} from 'lucide-react';

// TipTap Editor Component with Toolbar
const TipTapEditor = ({ content, onChange, readOnly = false, onEditorReady }) => {
  const editorRef = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');
  const [selectedText, setSelectedText] = useState('');
  const cursorPositionRef = useRef(null);

  useEffect(() => {
    if (content !== editorContent && editorRef.current) {
      // Save cursor position before updating content
      saveCursorPosition();
      setEditorContent(content || '');
      // Restore cursor position after content update
      setTimeout(() => {
        restoreCursorPosition();
      }, 0);
    }
  }, [content]);

  useEffect(() => {
    if (editorRef.current && onEditorReady) {
      onEditorReady(editorRef.current);
    }
  }, [onEditorReady]);

  const saveCursorPosition = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      cursorPositionRef.current = preCaretRange.toString().length;
    }
  };

  const restoreCursorPosition = () => {
    if (!editorRef.current || cursorPositionRef.current === null) return;

    const textNodes = [];
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    let charCount = 0;
    for (let i = 0; i < textNodes.length; i++) {
      const textNode = textNodes[i];
      const nodeLength = textNode.textContent.length;

      if (charCount + nodeLength >= cursorPositionRef.current) {
        const range = document.createRange();
        const offset = Math.min(cursorPositionRef.current - charCount, nodeLength);
        range.setStart(textNode, offset);
        range.collapse(true);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        break;
      }
      charCount += nodeLength;
    }
  };

  const handleContentChange = (newContent) => {
    setEditorContent(newContent);
    onChange?.(newContent);
  };

  const handleInput = (e) => {
    const newContent = e.target.innerHTML;
    handleContentChange(newContent);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    setSelectedText(selection.toString());
  };

  if (readOnly) {
    return (
      <div className="border border-gray-300 rounded-lg min-h-[400px] p-4 bg-gray-50">
        <div
          dangerouslySetInnerHTML={{ __html: editorContent }}
          className="min-h-[350px] outline-none"
          style={{
            lineHeight: '1.6',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'embed'
          }}
          dir="ltr"
        />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-200"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>

        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-200"
          defaultValue="3"
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        dangerouslySetInnerHTML={{ __html: editorContent }}
        onInput={handleInput}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        className="min-h-[400px] p-4 outline-none bg-white"
        style={{
          lineHeight: '1.6',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'embed'
        }}
        dir="ltr"
        placeholder="Start typing your contract template..."
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

// Field Types Configuration
const FIELD_TYPES = {
  text: { icon: Type, label: 'Text Input', color: 'bg-blue-100 text-blue-800' },
  textarea: { icon: MessageSquare, label: 'Text Area', color: 'bg-green-100 text-green-800' },
  select: { icon: ChevronDown, label: 'Dropdown', color: 'bg-purple-100 text-purple-800' },
  radio: { icon: Radio, label: 'Radio Button', color: 'bg-orange-100 text-orange-800' },
  date: { icon: Calendar, label: 'Date Picker', color: 'bg-pink-100 text-pink-800' },
  number: { icon: Hash, label: 'Number', color: 'bg-yellow-100 text-yellow-800' },
  email: { icon: Mail, label: 'Email', color: 'bg-indigo-100 text-indigo-800' },
  phone: { icon: Phone, label: 'Phone', color: 'bg-teal-100 text-teal-800' },
  address: { icon: MapPin, label: 'Address', color: 'bg-red-100 text-red-800' }
};

const ContractTemplateBuilder = () => {
  const [currentView, setCurrentView] = useState('templates'); // 'admin', 'user', 'preview', 'templates'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Rent Agreement Template',
      description: 'Standard rental agreement template',
      content: '<h2>RENTAL AGREEMENT</h2><p>This agreement is made between <<Landlord Name>> and <<Tenant Name>> for the property located at <<Property Address>>.</p><p>The monthly rent is <<Monthly Rent>> and the lease period is <<Lease Period>>.</p>',
      fields: [
        { id: 'landlord_name', type: 'text', label: 'Landlord Name', required: true },
        { id: 'tenant_name', type: 'text', label: 'Tenant Name', required: true },
        { id: 'property_address', type: 'address', label: 'Property Address', required: true },
        { id: 'monthly_rent', type: 'number', label: 'Monthly Rent', required: true },
        { id: 'lease_period', type: 'select', label: 'Lease Period', options: ['6 months', '1 year', '2 years'], required: true }
      ],
      createdAt: '2024-01-15'
    }
  ]);

  // Admin state
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    description: '',
    content: '',
    fields: []
  });
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);

  // User state
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [contractSigned, setContractSigned] = useState(false);

  // Admin Functions
  const handleNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      description: '',
      content: '<h2>New Contract Template</h2><p>Start creating your contract template here...</p>',
      fields: []
    });
    setEditingTemplateId(null);
    setCurrentView('admin');
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate({ ...template });
    setEditingTemplateId(template.id);
    setCurrentView('admin');
  };

  const handleAddField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${FIELD_TYPES[fieldType].label}`,
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };
    setEditingField(newField);
    setShowFieldModal(true);
  };

  const handleSaveField = (field) => {
    const updatedFields = editingField.id.startsWith('field_') && !currentTemplate.fields.find(f => f.id === editingField.id)
      ? [...currentTemplate.fields, field]
      : currentTemplate.fields.map(f => f.id === field.id ? field : f);

    setCurrentTemplate(prev => ({ ...prev, fields: updatedFields }));
    setShowFieldModal(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId) => {
    const fieldToDelete = currentTemplate.fields.find(f => f.id === fieldId);
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
      content: fieldToDelete ? prev.content.replace(
        new RegExp(`<<${fieldToDelete.label}>>`, 'g'),
        ''
      ) : prev.content
    }));
  };

  const insertPlaceholder = (field) => {
    if (!editorInstance) {
      console.log('Editor not available');
      return;
    }

    const placeholder = `<<${field.label}>>`;

    // Focus the editor first
    editorInstance.focus();

    // Get current selection or create one at the end
    const selection = window.getSelection();
    let range;

    if (selection.rangeCount > 0 && editorInstance.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      range = selection.getRangeAt(0);
    } else {
      // Create range at the end of content
      range = document.createRange();
      range.selectNodeContents(editorInstance);
      range.collapse(false);
    }

    // Create a text node with the placeholder
    const placeholderNode = document.createTextNode(` ${placeholder} `);

    // Insert the placeholder
    range.deleteContents();
    range.insertNode(placeholderNode);

    // Move cursor after the placeholder
    range.setStartAfter(placeholderNode);
    range.collapse(true);

    // Update selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Directly update the content without triggering the useEffect
    const newContent = editorInstance.innerHTML;
    handleContentChange(newContent);

    console.log('Placeholder inserted:', placeholder);
  };

  const handleContentChange = (newContent) => {
    setCurrentTemplate(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (editingTemplateId) {
      // Update existing template
      setTemplates(prev => prev.map(t =>
        t.id === editingTemplateId
          ? { ...currentTemplate, id: editingTemplateId }
          : t
      ));
      alert('Template updated successfully!');
    } else {
      // Create new template
      const newTemplate = {
        ...currentTemplate,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTemplates(prev => [...prev, newTemplate]);
      alert('Template saved successfully!');
    }

    setCurrentTemplate({ name: '', description: '', content: '', fields: [] });
    setEditingTemplateId(null);
    setCurrentView('templates');
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  // User Functions
  const handleStartContract = (template) => {
    setSelectedTemplate(template);
    setFormData({});
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setContractSigned(false);
    setCurrentView('user');
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNextStep = () => {
    const currentField = selectedTemplate.fields[currentStep];
    if (currentField.required && !formData[currentField.id]) {
      alert('This field is required');
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < selectedTemplate.fields.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentView('preview');
    }
  };

  const handleApproveContract = () => {
    setContractSigned(true);
    setTimeout(() => {
      alert('Contract has been approved and digitally signed! A copy has been sent to all parties.');
      setCurrentView('templates');
      setContractSigned(false);
    }, 1500);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return '';

    let content = selectedTemplate.content;
    selectedTemplate.fields.forEach(field => {
      const value = formData[field.id] || `[${field.label} - Not Provided]`;
      content = content.replace(
        new RegExp(`<<${field.label}>>`, 'g'),
        `<strong style="background-color: #dcfce7; padding: 2px 6px; border-radius: 3px;">${value}</strong>`
      );
    });
    return content;
  };

  const FieldModal = () => {
    const [fieldData, setFieldData] = useState(editingField || {});

    useEffect(() => {
      setFieldData(editingField || {});
    }, [editingField]);

    const handleSave = () => {
      if (!fieldData.label.trim()) {
        alert('Please enter a field label');
        return;
      }
      handleSaveField(fieldData);
    };

    if (!showFieldModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingField?.id?.startsWith('field_') ? 'Add' : 'Edit'} Field
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Field Label</label>
              <input
                type="text"
                value={fieldData.label || ''}
                onChange={(e) => setFieldData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter field label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Field Type</label>
              <select
                value={fieldData.type || 'text'}
                onChange={(e) => setFieldData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {Object.entries(FIELD_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {(fieldData.type === 'select' || fieldData.type === 'radio') && (
              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {(fieldData.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(fieldData.options || [])];
                        newOptions[index] = e.target.value;
                        setFieldData(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="flex-1 border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => {
                        const newOptions = fieldData.options.filter((_, i) => i !== index);
                        setFieldData(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFieldData(prev => ({
                    ...prev,
                    options: [...(prev.options || []), `Option ${(prev.options?.length || 0) + 1}`]
                  }))}
                  className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                >
                  + Add Option
                </button>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="required" className="text-sm">Required field</label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Field
            </button>
            <button
              onClick={() => setShowFieldModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFieldInput = (field) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Contract Builder</h1>
        </div>

        <nav className="mt-4">
          <button
            onClick={() => setCurrentView('templates')}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
              currentView === 'templates' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            <FileText className="mr-3" size={20} />
            Templates
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
              currentView === 'admin' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            <Settings className="mr-3" size={20} />
            Template Editor
          </button>

          <button
            onClick={() => setCurrentView('user')}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
              currentView === 'user' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            <Users className="mr-3" size={20} />
            User Portal
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {currentView === 'templates' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Contract Templates</h2>
                <button
                  onClick={handleNewTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="mr-2" size={16} />
                  Add New Template
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-800">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Created: {template.createdAt}</p>
                      <p className="text-xs text-gray-500">Fields: {template.fields.length}</p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleStartContract(template)}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                        >
                          Use Template
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          title="Edit Template"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <>
            {/* Editor Area */}
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingTemplateId ? 'Edit Template' : 'Create New Template'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentView('templates')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Save className="mr-2" size={16} />
                      {editingTemplateId ? 'Update Template' : 'Save Template'}
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4 h-full overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Template Name *</label>
                      <input
                        type="text"
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={currentTemplate.description}
                        onChange={(e) => setCurrentTemplate(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Template Content</label>
                    <TipTapEditor
                      content={currentTemplate.content}
                      onChange={handleContentChange}
                      onEditorReady={setEditorInstance}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Panel */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Dynamic Fields</h3>
                <p className="text-sm text-gray-600 mt-1">Add fields to collect user data</p>
              </div>

              {/* Field Types */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Field Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FIELD_TYPES).map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleAddField(key)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <IconComponent size={16} className="mb-1" />
                        <div className="text-xs text-gray-600">{config.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Fields */}
              <div className="p-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Fields</h4>
                <div className="space-y-2">
                  {currentTemplate.fields.map((field) => {
                    const config = FIELD_TYPES[field.type];
                    const IconComponent = config.icon;
                    return (
                      <div key={field.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <div className="flex items-center flex-1">
                          <IconComponent size={14} className="mr-2 text-gray-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{field.label}</div>
                            <div className={`text-xs px-2 py-1 rounded inline-block ${config.color}`}>
                              {config.label}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => insertPlaceholder(field)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Insert in template"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingField(field);
                              setShowFieldModal(true);
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Edit field"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete field"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {currentTemplate.fields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No fields added yet. Click a field type above to get started.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'user' && selectedTemplate && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setCurrentView('templates')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back
                </button>
              </div>

              {/* Progress Bar */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {currentStep + 1} of {selectedTemplate.fields.length} fields
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / selectedTemplate.fields.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Current Field */}
              <div className="p-6 flex-1">
                {selectedTemplate.fields.length > 0 && currentStep < selectedTemplate.fields.length && (
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">
                        {selectedTemplate.fields[currentStep].label}
                        {selectedTemplate.fields[currentStep].required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderFieldInput(selectedTemplate.fields[currentStep])}
                    </div>

                    <div className="flex gap-3">
                      {currentStep > 0 && (
                        <button
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 flex items-center justify-center"
                        >
                          <ArrowLeft className="mr-2" size={16} />
                          Previous
                        </button>
                      )}
                      <button
                        onClick={handleNextStep}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        {currentStep < selectedTemplate.fields.length - 1 ? (
                          <>
                            Next
                            <ArrowRight className="ml-2" size={16} />
                          </>
                        ) : (
                          <>
                            Review Contract
                            <Eye className="ml-2" size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'user' && !selectedTemplate && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
              <div className="text-center">
                <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Template Selected</h3>
                <p className="text-gray-600 mb-4">Please select a template from the Templates tab to get started.</p>
                <button
                  onClick={() => setCurrentView('templates')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Templates
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'preview' && selectedTemplate && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Contract Preview</h2>
                  <p className="text-sm text-gray-600">Review and approve your contract</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('user')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Edit
                  </button>
                  <button
                    onClick={handleApproveContract}
                    disabled={contractSigned}
                    className={`px-6 py-2 rounded-lg flex items-center ${
                      contractSigned
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {contractSigned ? (
                      <>
                        <Check className="mr-2" size={16} />
                        Contract Signed!
                      </>
                    ) : (
                      'Approve & Sign Contract'
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <TipTapEditor
                    content={generatePreview()}
                    readOnly={true}
                  />

                  {!contractSigned && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Eye className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Review Required</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Please review all the details above carefully before approving and signing this contract.
                            Once signed, this contract becomes legally binding.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FieldModal />
    </div>
  );
};

export default ContractTemplateBuilder;
