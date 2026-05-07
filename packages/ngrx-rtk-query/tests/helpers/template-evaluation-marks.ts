export const createTemplateEvaluationMarks = () => {
  let count = 0;

  return {
    mark: () => {
      count += 1;
      return '';
    },
    count: () => count,
  };
};
