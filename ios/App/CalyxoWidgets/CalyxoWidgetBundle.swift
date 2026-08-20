import WidgetKit
import SwiftUI

@main
struct CalyxoWidgetBundle: WidgetBundle {
    var body: some Widget {
        RingsWidget()
        HydrationWidget()
        NutritionWidget()
        ActivityWidget()
        if #available(iOS 16.1, *) {
            CalyxoLiveActivityWidget()
        }
    }
}
