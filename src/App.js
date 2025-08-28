import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const initialFormData = {
    label: '', 
    isRequired: false,
    defaultValue: '', 
    choices: ['Asia', 'Australia', 'Europe', 'Americas', 'Africa'],
    order: '', 
  };

  // State for the form data
  const [formData, setFormData] = useState(initialFormData);
  const [newChoice, setNewChoice] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setIsSaved(false);
  };
  const handleAddChoice = () => {
    const trimmedChoice = newChoice.trim();
    let newErrors = {};
    if (trimmedChoice === '') {
      newErrors.newChoice = 'Choice cannot be empty.';
    } else if (formData.choices.includes(trimmedChoice)) {
      newErrors.newChoice = 'Choice already exists.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...errors, ...newErrors });
      return;
    }

    const updatedChoices = [...formData.choices, trimmedChoice];
    setFormData({
      ...formData,
      choices: updatedChoices,
    });
    setNewChoice('');
    setErrors({});
    setIsSaved(false);
  };

  const handleCancelNewChoice = () => {
    setNewChoice('');
    setErrors({ ...errors, newChoice: '' });
  };

  const handleChoiceSelection = (choice) => {
    if (selectedChoices.includes(choice)) {
      setSelectedChoices(selectedChoices.filter((c) => c !== choice));
    } else {
      setSelectedChoices([...selectedChoices, choice]);
    }
    setIsSaved(false);
  };

  // Handles removing all selected choices
  const handleRemoveSelectedChoices = () => {
    if (selectedChoices.length > 0) {
      const updatedChoices = formData.choices.filter((choice) => !selectedChoices.includes(choice));
      const updatedDefaultValue = updatedChoices.includes(formData.defaultValue) ? formData.defaultValue : '';
      setFormData({
        ...formData,
        choices: updatedChoices,
        defaultValue: updatedDefaultValue,
      });
      setSelectedChoices([]);
      setIsSaved(false);
    }
  };

  const handleSaveChanges = () => {
    const newErrors = {};
    if (formData.label.trim() === '') {
      newErrors.label = 'Label is required.';
    }

    if (formData.defaultValue.trim() === '') {
      newErrors.defaultValue = 'Default Value is required.';
    }

    if (formData.order.trim() === '') {
      newErrors.order = 'Order is required.';
    }

    if (formData.isRequired && selectedChoices.length === 0) {
      newErrors.choices = 'At least one choice is required when "A Value is required" is checked.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaved(false);
    } else {
      setErrors({});
      // API call for saving data
      console.log('Saving form data:', formData);
      setIsSaved(true);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSaved(false);
    setSelectedChoices([]);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex) return;

    const newChoices = [...formData.choices];
    const [reorderedItem] = newChoices.splice(draggedItem, 1);
    newChoices.splice(targetIndex, 0, reorderedItem);

    setFormData({ ...formData, choices: newChoices });
    setDraggedItem(null);
  };

  // the order setting
  const sortedChoices = formData.order === 'Alphabetical'
    ? [...formData.choices].sort((a, b) => a.localeCompare(b))
    : formData.choices;

  // filter choices based on search query
  const filteredChoices = sortedChoices.filter(choice =>
    choice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        
        <h1 className="bg-blue-100 text-2xl font-bold mb-6 text-blue-400 border-b p-4 m-0">Field Builder</h1>
       
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="label" className="flex-1 text-sm font-medium text-gray-700">
              Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              className="flex-[2] rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sales region"
            />
          </div>
          {errors.label && <p className="mt-2 text-sm text-red-600 text-right">{errors.label}</p>}

          <div className="flex items-center space-x-4">
            <span className="flex-1 text-sm font-medium text-gray-700">Type</span>
            <div className="flex-[2] flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Multi-select</span>
              <input
                type="checkbox"
                id="isRequired"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded-md focus:ring-blue-500"
              />
              <label htmlFor="isRequired" className="text-sm text-gray-700">
                A Value is required
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="defaultValue" className="flex-1 text-sm font-medium text-gray-700">
              Default Value
            </label>
            <select
              id="defaultValue"
              name="defaultValue"
              value={formData.defaultValue}
              onChange={handleInputChange}
              className="flex-[2] rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a default value</option>
              {formData.choices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
          {errors.defaultValue && <p className="mt-2 text-sm text-red-600 text-right">{errors.defaultValue}</p>}

          {/* Choices section */}
          <div className="relative flex items-start space-x-4" ref={dropdownRef}>
            <label className="flex-1 block text-sm font-medium text-gray-700 pt-2">Choices</label>
            <div className="flex-[2]">

              <div
                className="border border-gray-300 rounded-md p-2 cursor-pointer flex items-center justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-gray-500">
                  Select choices...
                </span>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search choices..."
                      className="w-full p-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>
                  <div className="p-2 space-y-1">
                    {filteredChoices.length > 0 ? (
                      filteredChoices.map((choice, index) => (
                        <div
                          key={choice}
                          draggable={formData.order === 'Manual'}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`flex items-center space-x-2 p-1 rounded-md cursor-pointer ${formData.order === 'Manual' ? 'cursor-grab' : ''} hover:bg-gray-100`}
                          onClick={() => handleChoiceSelection(choice)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedChoices.includes(choice)}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">{choice}</span>
                          {formData.order === 'Manual' && (
                            <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic p-2">No choices found.</p>
                    )}
                  </div>
                </div>
              )}
              {errors.choices && <p className="mt-2 text-sm text-red-600 text-right">{errors.choices}</p>}
              
              {selectedChoices.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedChoices.map((choice) => (
                    <div
                      key={choice}
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {choice}
                      <button
                        type="button"
                        onClick={() => handleChoiceSelection(choice)}
                        className="ml-2 w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center hover:bg-blue-300 transition-colors"
                      >
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="order" className="flex-1 text-sm font-medium text-gray-700">
              Order
            </label>
            <div className="flex-[2]">
              <select
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Alphabetical">Display choices Alphabetical</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          {errors.order && <p className="mt-2 text-sm text-red-600 text-right">{errors.order}</p>}

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleSaveChanges}
              className="bg-green-500 text-white px-6 py-2 shadow-lg rounded-m hover:bg-green-600 transition-colors"
            >
              Save changes
            </button>
            <span className="text-gray-500">Оr</span>
            <button
              onClick={handleCancel}
              className="text-red-500 font-medium hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Success message */}
        {isSaved && (
          <div className="mt-4 p-3 bg-green-100 rounded-md text-green-700 text-sm">
            Changes saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
