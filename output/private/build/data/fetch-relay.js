"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRelayImages = fetchRelayImages;
const constants_1 = require("../constants");
async function fetchRelayImages(request, context, logger) {
    const response = await context.fetch(constants_1.RELAY_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    }, constants_1.RELAY_AUTH_ID);
    const rawText = await response.text();
    logger.info('Relay response received', {
        status: response.status,
        preview: rawText.slice(0, 500)
    });
    let parsed;
    try {
        parsed = rawText ? JSON.parse(rawText) : undefined;
    }
    catch (error) {
        logger.error('Relay response is not valid JSON', {
            error: String(error)
        });
    }
    if (response.ok && parsed && Array.isArray(parsed.images)) {
        return {
            ok: true,
            status: response.status,
            body: parsed
        };
    }
    return {
        ok: false,
        status: response.status,
        body: parsed,
        rawText
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtcmVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZGF0YS9mZXRjaC1yZWxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBCQSw0Q0E4Q0M7QUF4RUQsNENBQTREO0FBMEJyRCxLQUFLLFVBQVUsZ0JBQWdCLENBQ3BDLE9BQXFCLEVBQ3JCLE9BQXFCLEVBQ3JCLE1BQWM7SUFFZCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2xDLHlCQUFhLEVBQ2I7UUFDRSxNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU8sRUFBRTtZQUNQLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkM7UUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7S0FDOUIsRUFDRCx5QkFBYSxDQUNkLENBQUM7SUFFRixNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFO1FBQ3JDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtRQUN2QixPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0tBQy9CLENBQUMsQ0FBQztJQUVILElBQUksTUFBaUMsQ0FBQztJQUN0QyxJQUFJLENBQUM7UUFDSCxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBbUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3hFLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRTtZQUMvQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFFLE1BQStCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwRixPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUk7WUFDUixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLE1BQThCO1NBQ3JDLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTztRQUNMLEVBQUUsRUFBRSxLQUFLO1FBQ1QsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO1FBQ3ZCLElBQUksRUFBRSxNQUF3QztRQUM5QyxPQUFPO0tBQ1IsQ0FBQztBQUNKLENBQUMifQ==