"use client";

// React
import { useState, useEffect } from "react";

// Components
import { ActivityGraph } from "@/components/activity-graph";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDragDrop } from "@/components/drag-drop-context";
import { useToast } from "@/hooks/use-toast";

// Icons
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Edit,
  FolderOpen,
  Loader2,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";

// Utils
import { apiService, type Dataset } from "@/lib/api";

interface DatasetActionsSheetProps {
  dataset: Dataset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Action = "view" | "update";

export function DatasetActionsSheet({
  dataset,
  open,
  onOpenChange,
  onSuccess,
}: DatasetActionsSheetProps) {
  const { toast } = useToast();
  const [currentAction, setCurrentAction] = useState<Action>("view");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    isDragging,
    activeDropZone,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop: contextHandleDrop,
  } = useDragDrop();

  // Update form values when dataset changes
  useEffect(() => {
    if (dataset) {
      setDatasetName(dataset.name || "");
      setDatasetDescription(dataset.description || "");
    }
  }, [dataset]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setSelectedFile(selectedFiles[0]);
    }
  };

  const handleUpdateDataset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataset) return;

    if (!datasetName.trim()) {
      setErrorMessage("Please enter a dataset name");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", datasetName.trim());
      formData.append("description", datasetDescription.trim() || "");

      if (selectedFile) {
        formData.append("dataset", selectedFile);
      }

      const result = await apiService.updateDataset(dataset.id, formData);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update dataset"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDataset = async () => {
    if (!dataset) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await apiService.deleteDataset(dataset.name);
      toast({
        title: "Success",
        description: result.message,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to delete dataset"
      );
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownloadDataset = async () => {
    if (!dataset) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await apiService.downloadDatasetPrivate(dataset.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${dataset.name}.csv`;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);
      toast({
        title: "Success",
        description: "Dataset downloaded successfully",
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to download dataset"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormState = () => {
    setSelectedFile(null);
    setDatasetName(dataset?.name || "");
    setDatasetDescription(dataset?.description || "");
    setErrorMessage("");
    setIsLoading(false);
  };

  const handleSheetOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetFormState();
      setCurrentAction("view");
    }
    onOpenChange(newOpen);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    if (currentAction !== "update") return;

    contextHandleDrop(e, "update-dataset", (droppedFile) => {
      setSelectedFile(droppedFile);
    });
  };

  if (!dataset) return null;

  const renderContent = () => {
    switch (currentAction) {
      case "update":
        return (
          <form
            onSubmit={handleUpdateDataset}
            className="space-y-4"
            onDragEnter={(e) => handleDragEnter(e, "update-dataset")}
            onDragLeave={(e) => handleDragLeave(e, "update-dataset")}
            onDragOver={(e) => handleDragOver(e, "update-dataset")}
            onDrop={handleFileDrop}
          >
            <div className="space-y-2">
              <Label htmlFor="dataset-file">
                Update Dataset File (optional)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  activeDropZone === "update-dataset" && isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                <input
                  id="dataset-file"
                  type="file"
                  onChange={handleFileSelection}
                  className="hidden"
                />
                <label htmlFor="dataset-file" className="cursor-pointer">
                  <div className="space-y-2">
                    <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-primary hover:underline">
                        {activeDropZone === "update-dataset" && isDragging
                          ? "Drop your file here"
                          : "Click to select a new file"}
                      </span>
                      <p className="text-muted-foreground mt-1">
                        Current file: {dataset.name}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Dataset Name *</Label>
              <Input
                id="name"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter dataset name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                placeholder="Brief description of the dataset"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentAction("view")}
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Update Dataset
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case "view":
      default:
        return (
          <div
            className="flex flex-col h-full space-y-4"
            onDragEnter={(e) => handleDragEnter(e, "update-dataset")}
            onDragLeave={(e) => handleDragLeave(e, "update-dataset")}
            onDragOver={(e) => handleDragOver(e, "update-dataset")}
            onDrop={handleFileDrop}
          >
            {/* Dataset Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Format</div>
                <div className="font-medium">{dataset.type.toUpperCase()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Size</div>
                <div className="font-medium">{dataset.size}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Created</div>
                <div className="font-medium">
                  {new Date(dataset.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {new Date(dataset.lastUpdated).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Activity Graph */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Activity Overview
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Last 12 weeks
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ActivityGraph data={dataset.activityData} fullWidth />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                  <div>Total Requests: 1</div>
                  <div>Avg: 0/week</div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadDataset}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Dataset
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentAction("update")}
                  disabled={isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Dataset
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Dataset
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          className="overflow-y-auto flex flex-col"
          onDragEnter={(e) => handleDragEnter(e, "update-dataset")}
          onDragLeave={(e) => handleDragLeave(e, "update-dataset")}
          onDragOver={(e) => handleDragOver(e, "update-dataset")}
          onDrop={handleFileDrop}
        >
          <SheetHeader>
            <SheetTitle>
              {currentAction === "update"
                ? `Update ${dataset.name}`
                : dataset.name}
            </SheetTitle>
            <SheetDescription>
              {currentAction === "update"
                ? "Update your dataset information"
                : dataset.description}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1">
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="break-all">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {renderContent()}
          </div>

          {currentAction === "view" && (
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
                autoFocus={true}
              >
                Close
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Dataset
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{dataset.name}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDataset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
