import axiosInstance from './axiosConfig';

// Récupérer les documents par niveau pour la bibliothèque
export const getDocumentsByNiveau = async (niveau) => {
  try {
    console.log('📚 getDocumentsByNiveau - niveau:', niveau);
    
    // ✅ Normaliser le niveau en majuscules pour correspondre à la DB
    const niveauUpperCase = niveau?.toUpperCase();
    
    const response = await axiosInstance.get(`/documents/library`, {
      params: { niveau: niveauUpperCase }
    });
    
    console.log('✅ Documents reçus:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching documents by niveau:', error);
    console.error('Détails:', error.response?.data);
    throw error;
  }
};

// Télécharger un document
export const downloadDocument = async (documentId) => {
  try {
    console.log('⬇️ downloadDocument - id:', documentId);
    
    const response = await axiosInstance.get(`/documents/download/${documentId}`, {
      responseType: 'blob'
    });
    
    console.log('✅ Document téléchargé');
    return response.data;
  } catch (error) {
    console.error('❌ Error downloading document:', error);
    throw error;
  }
};

// Incrémenter le compteur de téléchargements
export const incrementDownloadCount = async (documentId) => {
  try {
    console.log('📊 incrementDownloadCount - id:', documentId);
    
    const response = await axiosInstance.post(`/documents/${documentId}/increment-download`);
    
    console.log('✅ Compteur incrémenté:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error incrementing download count:', error);
    throw error;
  }
};

// Upload document (si besoin)
export const uploadDocument = async (formData) => {
  try {
    console.log('📤 uploadDocument');
    
    const response = await axiosInstance.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Document uploadé:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    throw error;
  }
};