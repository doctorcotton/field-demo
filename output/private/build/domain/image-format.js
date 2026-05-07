"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedInputMimeType = isSupportedInputMimeType;
exports.inferImageExtension = inferImageExtension;
exports.ensureImageFileName = ensureImageFileName;
const MIME_TO_EXTENSION = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp'
};
function isSupportedInputMimeType(mimeType) {
    return Boolean(MIME_TO_EXTENSION[mimeType]);
}
function inferImageExtension(name, mimeType) {
    const normalizedName = (name || '').toLowerCase();
    if (normalizedName.endsWith('.png'))
        return 'png';
    if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) {
        return 'jpg';
    }
    if (normalizedName.endsWith('.webp'))
        return 'webp';
    if (mimeType && MIME_TO_EXTENSION[mimeType])
        return MIME_TO_EXTENSION[mimeType];
    return 'png';
}
function ensureImageFileName(name, mimeType) {
    const baseName = (name || '').trim() || 'vision-draft-image';
    if (/\.[a-zA-Z0-9]+$/.test(baseName)) {
        return baseName;
    }
    return `${baseName}.${inferImageExtension(baseName, mimeType)}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2RvbWFpbi9pbWFnZS1mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSw0REFFQztBQUVELGtEQVNDO0FBRUQsa0RBTUM7QUEzQkQsTUFBTSxpQkFBaUIsR0FBMkI7SUFDaEQsV0FBVyxFQUFFLEtBQUs7SUFDbEIsWUFBWSxFQUFFLEtBQUs7SUFDbkIsWUFBWSxFQUFFLE1BQU07Q0FDckIsQ0FBQztBQUVGLFNBQWdCLHdCQUF3QixDQUFDLFFBQWdCO0lBQ3ZELE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQWdCLG1CQUFtQixDQUFDLElBQVksRUFBRSxRQUFpQjtJQUNqRSxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNsRCxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDbEQsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUN4RSxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUM7SUFDcEQsSUFBSSxRQUFRLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDO1FBQUUsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRixPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsUUFBaUI7SUFDakUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksb0JBQW9CLENBQUM7SUFDN0QsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUNyQyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ0QsT0FBTyxHQUFHLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztBQUNsRSxDQUFDIn0=