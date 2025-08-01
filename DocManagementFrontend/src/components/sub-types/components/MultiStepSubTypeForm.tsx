import { useSubTypeForm } from "./SubTypeFormProvider";
import { SubTypeFormProgress } from "./SubTypeFormProgress";
import { SubTypeBasicInfo } from "./SubTypeBasicInfo";
import { SubTypeDates } from "../components/SubTypeDates";
import { SubTypeReview } from "../components/SubTypeReview";
import { SubTypeFormActions } from "./SubTypeFormActions";
import { AnimatePresence, motion } from "framer-motion";

interface MultiStepSubTypeFormProps {
  onCancel: () => void;
}

export const MultiStepSubTypeForm = ({
  onCancel,
}: MultiStepSubTypeFormProps) => {
  const { currentStep } = useSubTypeForm();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SubTypeDates />;
      case 2:
        return <SubTypeBasicInfo />;
      case 3:
        return <SubTypeReview />;
      default:
        return <SubTypeDates />;
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <SubTypeFormProgress />
      </div>

      <div className="flex-grow min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-blue-900/30">
        <SubTypeFormActions onCancel={onCancel} />
      </div>
    </div>
  );
};
