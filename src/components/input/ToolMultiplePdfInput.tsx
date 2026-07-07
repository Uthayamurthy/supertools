import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { useTranslation } from 'react-i18next';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface MultiPdfInputComponentProps {
  accept: string[];
  title?: string;
  type: 'pdf';
  value: MultiPdfInput[];
  onChange: (file: MultiPdfInput[]) => void;
}

export interface MultiPdfInput {
  file: File;
  order: number;
}

function PdfFileThumbnail({
  file,
  orderLabel
}: {
  file: File;
  orderLabel: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderPreview = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = 72 / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          return;
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({
          canvas,
          canvasContext: context,
          viewport
        }).promise;

        if (isMounted) {
          setPreview(canvas.toDataURL('image/png'));
        }
      } catch (error) {
        if (isMounted) {
          setPreview(null);
        }
      }
    };

    renderPreview();

    return () => {
      isMounted = false;
    };
  }, [file]);

  return (
    <Box
      sx={{
        width: { xs: 52, sm: 72 },
        height: { xs: 64, sm: 88 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt={t('toolMultipleInput.filePreview', { fileName: file.name })}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            bgcolor: '#F7F7F8'
          }}
        />
      ) : (
        <PictureAsPdfIcon sx={{ color: '#E4002B' }} />
      )}
      <Box
        sx={{
          position: 'absolute',
          left: 4,
          top: 4,
          minWidth: 22,
          height: 20,
          px: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderColor: '#E4002B',
          bgcolor: '#fff',
          color: '#E4002B',
          borderRadius: 0.5,
          fontSize: 11,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {orderLabel}
      </Box>
    </Box>
  );
}

export default function ToolMultiFileInput({
  value,
  onChange,
  accept,
  title,
  type
}: MultiPdfInputComponentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const normalizeOrder = (pdfInputs: MultiPdfInput[]) =>
    pdfInputs.map((pdfInput, index) => ({ ...pdfInput, order: index }));

  const orderedFiles = normalizeOrder(
    [...value].sort((a, b) => a.order - b.order)
  );

  const updateFiles = (pdfInputs: MultiPdfInput[]) => {
    onChange(normalizeOrder(pdfInputs));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files)
      updateFiles([
        ...orderedFiles,
        ...Array.from(files).map((file, index) => ({
          file,
          order: orderedFiles.length + index
        }))
      ]);
    event.target.value = '';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  function handleClear() {
    onChange([]);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const moveFile = (sourceIndex: number, destinationIndex: number) => {
    if (
      destinationIndex === sourceIndex ||
      destinationIndex < 0 ||
      destinationIndex >= orderedFiles.length
    ) {
      return;
    }

    const updatedFiles = [...orderedFiles];
    const [movedFile] = updatedFiles.splice(sourceIndex, 1);
    updatedFiles.splice(destinationIndex, 0, movedFile);
    updateFiles(updatedFiles);
  };

  const handleDrop = (destinationIndex: number) => {
    if (draggedIndex === null) {
      return;
    }

    moveFile(draggedIndex, destinationIndex);
    setDraggedIndex(null);
  };

  return (
    <Box>
      <InputHeader
        title={
          title ||
          t('toolMultipleInput.inputTitle', {
            type: type.charAt(0).toUpperCase() + type.slice(1)
          })
        }
      />
      <Box
        sx={{
          width: '100%',
          height: value?.length ? { xs: 340, sm: 380 } : 300,
          border: 1,
          borderRadius: 1,
          borderColor: value?.length ? 'divider' : 'text.secondary',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          width="100%"
          height="100%"
          sx={{
            overflow: value?.length ? 'auto' : 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {value?.length ? (
            <Box
              sx={{
                width: '100%',
                minWidth: { xs: 520, sm: 0 },
                alignSelf: 'stretch'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle2">
                  {t('toolMultipleInput.orderPreviewTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('toolMultipleInput.selectedFilesCount', {
                    count: orderedFiles.length
                  })}
                </Typography>
              </Box>
              {orderedFiles.map((pdfInput, index) => (
                <Box
                  key={`${pdfInput.file.name}-${pdfInput.file.lastModified}-${index}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDrop={() => handleDrop(index)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '52px minmax(0, 1fr) auto',
                      sm: '72px minmax(0, 1fr) auto'
                    },
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 },
                    px: 2,
                    py: 1.5,
                    borderBottom: index === orderedFiles.length - 1 ? 0 : 1,
                    borderColor: 'divider',
                    cursor: 'grab',
                    bgcolor:
                      draggedIndex === index
                        ? theme.palette.action.hover
                        : 'transparent'
                  }}
                >
                  <PdfFileThumbnail
                    file={pdfInput.file}
                    orderLabel={String(index + 1).padStart(2, '0')}
                  />

                  <Tooltip title={pdfInput.file.name}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {pdfInput.file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('toolMultipleInput.filePosition', {
                          position: index + 1
                        })}
                        {' · '}
                        {formatFileSize(pdfInput.file.size)}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Tooltip title={t('toolMultipleInput.moveUp')}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t('toolMultipleInput.moveUp')}
                          disabled={index === 0}
                          onClick={() => moveFile(index, index - 1)}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('toolMultipleInput.moveDown')}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t('toolMultipleInput.moveDown')}
                          disabled={index === orderedFiles.length - 1}
                          onClick={() => moveFile(index, index + 1)}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('toolMultipleInput.deleteFile')}>
                      <IconButton
                        size="small"
                        aria-label={t('toolMultipleInput.deleteFile')}
                        onClick={() => {
                          updateFiles(
                            orderedFiles.filter((_, fileIndex) => {
                              return fileIndex !== index;
                            })
                          );
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('toolMultipleInput.noFilesSelected')}
            </Typography>
          )}
        </Box>
      </Box>

      <InputFooter handleImport={handleImportClick} handleClear={handleClear} />
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        accept={accept.join(',')}
        onChange={handleFileChange}
        multiple={true}
      />
    </Box>
  );
}
