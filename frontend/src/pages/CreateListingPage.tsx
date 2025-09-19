import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreateListingForm from "@/components/CreateListingForm";
import { ArrowLeft } from "lucide-react";

const CreateListingPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na kontrolnu ploču
        </Button>

        {/* Form */}
        <CreateListingForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateListingPage;